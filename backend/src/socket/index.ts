import type { Server } from "socket.io";
import verifySocketJwt from "./authSocket";
import { OnlineUsers } from "./onlineUsers";
import type { AppSocket, ClientToServerEvents, SendMessagePayload, SocketUserId, ServerToClientEvents } from "./types";
import { incrementUnreadForReceiver, updateDelivered, updateSeen } from "../services/receipt.service";

// Simple helper
const safeString = (v: unknown) => (typeof v === "string" ? v : undefined);

const onlineUsers = new OnlineUsers();

export const initSocket = (io: Server) => {
  // Attach JWT auth middleware for all socket connections
  io.use(verifySocketJwt as any);

  io.on("connection", (socket: AppSocket) => {
    const userId = socket.data.userId;
    console.log(`[socket] connected user=${userId} socket=${socket.id}`);

    // Presence: map user -> socket
    onlineUsers.set(userId, socket.id);

    // Notify others
    socket.broadcast.emit("userOnline", { userId });

    // Required event: userOnline
    socket.on("userOnline", (incomingUserId: SocketUserId, ack) => {
      // If client sends a different userId, prefer authenticated one.
      const finalUserId = safeString(incomingUserId) ?? userId;
      onlineUsers.set(finalUserId, socket.id);
      socket.broadcast.emit("userOnline", { userId: finalUserId });
      ack?.({ ok: true });
    });

    socket.on("typing", ({ receiverId }: { receiverId: SocketUserId }) => {
      const receiverSocketId = onlineUsers.getSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { userId });
      }
    });

    socket.on("stopTyping", ({ receiverId }: { receiverId: SocketUserId }) => {
      const receiverSocketId = onlineUsers.getSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { userId });
      }
    });

    // Send message: Step 2 — persist to MongoDB and emit only to intended receiver
    socket.on("sendMessage", async (payload: SendMessagePayload, ack) => {
      try {
        const receiverId = safeString(payload.receiverId);
        const senderId = safeString(payload.senderId);

        if (!receiverId || !senderId) {
          return ack?.({ ok: false, error: "senderId/receiverId are required" });
        }

        // Ensure senderId matches authenticated user.
        if (senderId !== userId) {
          return ack?.({ ok: false, error: "senderId mismatch" });
        }

        // Persist message
        const { handleSendMessage } = await import("../controllers/message.controller");
        const result = await handleSendMessage({
          ...payload,
          senderIdAuth: userId,
        });

        const receiverSocketId = onlineUsers.getSocketId(receiverId);

        // Ack back to sender (sent)
        ack?.({
          ok: true,
          messageId: result.messageId,
          clientMessageId: payload.clientMessageId,
        });

        // If receiver is online, emit immediately. If offline, increment unreadCount.
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", {
            ...payload,
            id: result.messageId,
            status: "sent",
            createdAt: result.createdAt,
          });
        } else {
          // receiver offline => increment unread
          await incrementUnreadForReceiver(result.conversationId, receiverId, 1);
        }

        // Update conversation lastMessage (already done inside handleSendMessage)
      } catch (e) {
        ack?.({ ok: false, error: "sendMessage failed" });
      }
    });

    // Client reports delivery (DB-driven)
    socket.on("messageDelivered", async ({ receiverId, messageId, clientMessageId }) => {
      try {
        // receiverId should be the authenticated user who is reporting delivery
        if (receiverId !== userId) return;

        const receipt = await updateDelivered({ messageId, clientMessageId, receiverId });

        const senderSocketId = onlineUsers.getSocketId(receipt.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageDelivered", {
            userId: receiverId,
            messageId,
            clientMessageId,
          });
        }
      } catch {
        // ignore receipt errors
      }
    });

    // Client reports seen (DB-driven)
    socket.on("messageSeen", async ({ receiverId, messageId, clientMessageId }) => {
      try {
        if (receiverId !== userId) return;

        const receipt = await updateSeen({ messageId, receiverId });

        const senderSocketId = onlineUsers.getSocketId(receipt.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageSeen", {
            userId: receiverId,
            messageId,
            clientMessageId,
          });
        }
      } catch {
        // ignore receipt errors
      }
    });

    socket.on("disconnect", () => {
      const removedUserId = onlineUsers.removeBySocketId(socket.id) ?? userId;
      console.log(`[socket] disconnected user=${removedUserId} socket=${socket.id}`);
      socket.broadcast.emit("userOffline", { userId: removedUserId });
    });
  });
};

