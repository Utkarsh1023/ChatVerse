import { Server,Socket  } from "socket.io";
import jwt from "jsonwebtoken";
import type http from "http";
import Message from "../models/Message";
import Conversation from "../models/Conversation";
import User from "../models/User";
import * as notificationSocket from "./notification.socket";

const onlineUsers = new Map<string, string>();

let io: Server | null = null;

/** Access the Socket.IO instance from anywhere (controllers/services). */
export const getIO = (): Server | null => io;

/**
 * Emit a friend-specific event to a user's personal room.
 * Safe no-op when Socket.IO is not initialised (e.g. during tests).
 */
export const emitToUser = (
  userId: string,
  event: string,
  payload: unknown
): void => {
  const server = getIO();
  if (!server) return;
  server.to(`user:${userId}`).emit(event, payload);
};

/**
 * Notify all of a user's friends that their profile was updated
 * (avatar, name, bio, cover, etc.) so cards can refresh in real time.
 */
export const notifyProfileUpdated = async (
  userId: string,
  profile?: Record<string, unknown>
): Promise<void> => {
  const server = getIO();
  if (!server) return;

  let profilePayload = profile;

  if (!profilePayload) {
    const user = await User.findById(userId)
      .select("name username avatar bio profession coverImage")
      .lean();
    if (user) {
      profilePayload = user as unknown as Record<string, unknown>;
    }
  }

  const user = await User.findById(userId).select("friends").lean();
  if (!user) return;

  for (const friendId of user.friends ?? []) {
    server.to(`user:${String(friendId)}`).emit("profileUpdated", {
      userId: String(userId),
      profile: profilePayload ?? null,
    });
  }
};

/**
 * Notify all of a user's friends that their friend list changed
 * (e.g. a request was accepted → friendsUpdated).
 */
export const notifyFriendsUpdated = async (userId: string): Promise<void> => {
  const server = getIO();
  if (!server) return;

  const user = await User.findById(userId).select("friends").lean();
  if (!user) return;

  for (const friendId of user.friends ?? []) {
    server.to(`user:${String(friendId)}`).emit("friendsUpdated", {
      userId: String(userId),
    });
  }
};

export const initSocket = (server: http.Server) => {
  const allowedOrigins = [
  "http://localhost:5173", // local development
  "https://chat-verse-gules.vercel.app", // deployed frontend
];

const socketServer = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin not allowed by CORS"));
      }
    },
    credentials: true,
  },
});

  // Store the instance for external access (controllers/services).
  io = socketServer;

  // JWT authentication for socket handshake
  socketServer.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error: missing token"));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!
      ) as { id: string };

      (socket as any).userId = decoded.id;
      next();
    } catch {
      next(new Error("Authentication error: invalid token"));
    }
  });

  socketServer.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // 🔔 Notification sync handlers (mark read, read-all, delete, get-unread).
    const registerNotificationHandlers =
      (notificationSocket as any).registerNotificationHandlers ||
      (notificationSocket as any).default?.registerNotificationHandlers;

    if (typeof registerNotificationHandlers === "function") {
      registerNotificationHandlers({
        server: socketServer,
        socket,
        userId: (socket as any).userId,
      });
    }

    socket.on("join", async () => {
      const userId = (socket as any).userId;

      onlineUsers.set(userId, socket.id);

      socket.join(`user:${userId}`);

      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        socketId: socket.id,
      });

      socketServer.emit("userOnline", userId);

      // 🔔 Notify each of this user's friends that they came online.
      try {
        const user = await User.findById(userId).select("friends").lean();
        if (user) {
          for (const friendId of user.friends ?? []) {
            socketServer
              .to(`user:${String(friendId)}`)
              .emit("friendOnline", { userId: String(userId) });
          }
        }
      } catch (err) {
        console.error("friendOnline notify error:", err);
      }
    });

    socket.on(
      "sendMessage",
      async (
        payload: {
          receiverId: string;
          text?: string;
          clientMessageId?: string;
          attachments?: Array<{ url: string; filename?: string; size?: number; mimeType?: string }>;
        },
        ack?: Function
      ) => {
        try {
          const senderId = (socket as any).userId;

          let conversation = await Conversation.findOne({
            participants: {
              $all: [senderId, payload.receiverId],
            },
          });

          if (!conversation) {
            conversation = await Conversation.create({
              participants: [senderId, payload.receiverId],
            });
          }

          const message = await Message.create({
            conversationId: conversation._id,
            senderId,
            receiverId: payload.receiverId,
            text: payload.text ?? "",
            attachments: (payload.attachments ?? []).map((a) => a.url),
            status: "sent",
          });

          conversation.lastMessage = message._id as any;
          await conversation.save();

          socketServer.to(`user:${payload.receiverId}`).emit(
            "receiveMessage",
            {
              ...message.toObject(),
              clientMessageId: payload.clientMessageId,
            }
          );

          ack?.({
            ok: true,
            messageId: message._id,
          });

        } catch (err) {
          console.log(err);

          ack?.({
            ok: false,
          });
        }
      }
    );

    socket.on(
      "typing",
      (data: { receiverId: string }, ack?: (res: { ok: boolean }) => void) => {
        socketServer.to(`user:${data.receiverId}`).emit("typing", {
          userId: (socket as any).userId,
        });
        ack?.({ ok: true });
      }
    );

    socket.on(
      "stopTyping",
      (data: { receiverId: string }, ack?: (res: { ok: boolean }) => void) => {
        socketServer.to(`user:${data.receiverId}`).emit("stopTyping", {
          userId: (socket as any).userId,
        });
        ack?.({ ok: true });
      }
    );


    
    socket.on(
      "messageDelivered",
      async ({ messageId }: { messageId: string }) => {
        try {
          const message = await Message.findByIdAndUpdate(
            messageId,
            {
              status: "delivered",
              deliveredAt: new Date(),
            },
            { new: true }
          );

          if (!message) return;

          socketServer.to(`user:${message.senderId}`).emit("messageDelivered", {
            messageId,
          });

        } catch (error) {
          console.error("messageDelivered error:", error);
        }
      }
    );
    socket.on(
      "messageSeen",
      async ({ messageId }: { messageId: string }) => {
        try {
          const message = await Message.findByIdAndUpdate(
            messageId,
            {
              status: "seen",
              seenAt: new Date(),
            },
            { new: true }
          );

          if (!message) return;

          socketServer.to(`user:${message.senderId}`).emit("messageSeen", {
            messageId,
          });

        } catch (error) {
          console.error("messageSeen error:", error);
        }
      }
    );

socket.on(
      "messagesSeen",
      async ({ conversationId }: { conversationId: string }) => {
        try {
          const userId = (socket as any).userId;

          // Mark all messages in this conversation that were SENT TO this user
          // and are not yet seen as "seen" (bulk WhatsApp-style read receipt).
          const messages = await Message.find({
            conversationId,
            receiverId: userId,
            status: { $ne: "seen" },
          });

          if (messages.length === 0) return;

          const messageIds = messages.map((m) => m._id);

          await Message.updateMany(
            { _id: { $in: messageIds } },
            { status: "seen", seenAt: new Date() }
          );

// Notify each unique sender so they can flip to the cyan double-tick.
          const senderMap = new Map<string, string[]>();
          messages.forEach((m) => {
            const sid = m.senderId.toString();
            const arr = senderMap.get(sid) || [];
            arr.push(m._id.toString());
            senderMap.set(sid, arr);
          });

          senderMap.forEach((ids, senderId) => {
            socketServer.to(`user:${senderId}`).emit("messagesSeen", {
              conversationId,
              messageIds: ids,
            });
          });
        } catch (error) {
          console.error("messagesSeen error:", error);
        }
      }
    );

    socket.on(
      "deleteMessage",
      async ({ messageId }: { messageId: string }) => {
        try {
          const userId = (socket as any).userId;

          const message = await Message.findById(messageId);
          if (!message) return;

          // Only the sender can delete their own message
          if (message.senderId.toString() !== userId) return;

          message.deleted = true;
          await message.save();

          // Notify both participants so the UI updates for both sender and receiver
          const participants = [message.senderId.toString(), message.receiverId.toString()];
          participants.forEach((pid) => {
            socketServer.to(`user:${pid}`).emit("messageDeleted", {
              messageId,
              conversationId: message.conversationId,
            });
          });
        } catch (error) {
          console.error("deleteMessage error:", error);
        }
      }
    );

socket.on("disconnect", async () => {
      const userId = (socket as any).userId;

      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: "",
      });

      socketServer.emit("userOffline", userId);

      // 🔔 Notify each of this user's friends that they went offline.
      try {
        const user = await User.findById(userId).select("friends").lean();
        if (user) {
          for (const friendId of user.friends ?? []) {
            socketServer
              .to(`user:${String(friendId)}`)
              .emit("friendOffline", { userId: String(userId) });
          }
        }
      } catch (err) {
        console.error("friendOffline notify error:", err);
      }

      console.log("Disconnected", socket.id);
    });
  });

  return io;
};

