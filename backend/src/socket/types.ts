import type { Socket } from "socket.io";

export type SocketUserId = string;

export type SendMessagePayload = {
  senderId: SocketUserId;
  receiverId: SocketUserId;
  conversationId?: string;
  text?: string;
  attachments?: Array<{ url: string; filename?: string }>;
  clientMessageId?: string; // for optimistic UI + deduplication
};

export type ClientToServerEvents = {
  // Required by task
  userOnline: (userId: SocketUserId, ack?: (res: { ok: boolean }) => void) => void;

  sendMessage: (
    payload: SendMessagePayload,
    ack?: (res:
      | { ok: true; messageId?: string; clientMessageId?: string }
      | { ok: false; error: string }) => void
  ) => void;

  typing: (data: { receiverId: SocketUserId }, ack?: (res: { ok: boolean }) => void) => void;
  stopTyping: (
    data: { receiverId: SocketUserId },
    ack?: (res: { ok: boolean }) => void
  ) => void;

  // Read/delivered acknowledgements from client side
  messageDelivered: (
    data: {
      receiverId: SocketUserId;
      messageId?: string;
      clientMessageId?: string;
    },
    ack?: (res: { ok: boolean }) => void
  ) => void;

  messageSeen: (
    data: {
      receiverId: SocketUserId;
      messageId?: string;
      clientMessageId?: string;
    },
    ack?: (res: { ok: boolean }) => void
  ) => void;
};

export type ServerToClientEvents = {
  receiveMessage: (payload: SendMessagePayload & { id?: string; status?: string; createdAt?: string }) => void;

  userOnline: (data: { userId: SocketUserId }) => void;
  userOffline: (data: { userId: SocketUserId }) => void;

  typing: (data: { userId: SocketUserId }) => void;
  stopTyping: (data: { userId: SocketUserId }) => void;

  messageDelivered: (data: {
    userId: SocketUserId;
    messageId?: string;
    clientMessageId?: string;
  }) => void;

  messageSeen: (data: {
    userId: SocketUserId;
    messageId?: string;
    clientMessageId?: string;
  }) => void;
};

export type SocketData = {
  userId: SocketUserId;
};

export type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, any, SocketData>;

