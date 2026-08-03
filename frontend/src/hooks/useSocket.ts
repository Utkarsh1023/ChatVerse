import { useCallback } from "react";
import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, SocketUserId, SendMessagePayload } from "../socket/socketTypes";
import { useSocketContext } from "../context/SocketContext";

export const useSocket = () => {
  const ctx = useSocketContext();
  const socket = ctx?.socket ?? null;



  const emitSendMessage = useCallback(
    (payload: SendMessagePayload, ack?: (res: any) => void) => {
      if (!socket) return;
      (socket as unknown as Socket<ClientToServerEvents, any>).emit("sendMessage", payload, ack);
    },
    [socket]
  );

  const emitTyping = useCallback(
    (receiverId: SocketUserId) => {
      if (!socket) return;
      (socket as unknown as Socket<ClientToServerEvents, any>).emit("typing", { receiverId });
    },
    [socket]
  );

  const emitStopTyping = useCallback(
    (receiverId: SocketUserId) => {
      if (!socket) return;
      (socket as unknown as Socket<ClientToServerEvents, any>).emit("stopTyping", { receiverId });
    },
    [socket]
  );

  const emitMessageDelivered = useCallback(
    (data: { receiverId: SocketUserId; messageId?: string; clientMessageId?: string }) => {
      if (!socket) return;
      (socket as unknown as Socket<ClientToServerEvents, any>).emit("messageDelivered", data);
    },
    [socket]
  );

  const emitMessageSeen = useCallback(
    (data: { receiverId: SocketUserId; messageId?: string; clientMessageId?: string }) => {
      if (!socket) return;
      (socket as unknown as Socket<ClientToServerEvents, any>).emit("messageSeen", data);
    },
    [socket]
  );

const emitMessagesSeen = useCallback(
    (data: { conversationId: string }) => {
      if (!socket) return;
      (socket as unknown as Socket<ClientToServerEvents, any>).emit("messagesSeen", data);
    },
    [socket]
  );

  const emitDeleteMessage = useCallback(
    (data: { messageId: string; conversationId?: string }) => {
      if (!socket) return;
      (socket as unknown as Socket<ClientToServerEvents, any>).emit("deleteMessage", data);
    },
    [socket]
  );

  return { emitSendMessage, emitTyping, emitStopTyping, emitMessageDelivered, emitMessageSeen, emitMessagesSeen, emitDeleteMessage };

};

