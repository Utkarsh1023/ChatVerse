export type SocketUserId = string;

export type Attachment = { url: string; filename?: string };

export type SendMessagePayload = {
  senderId: SocketUserId;
  receiverId: SocketUserId;
  conversationId?: string;
  text?: string;
  attachments?: Attachment[];
  clientMessageId?: string;
};

export type MessageStatus = "sent" | "delivered" | "seen";

export type ReceiveMessagePayload = SendMessagePayload & {
  id?: string;
  status?: MessageStatus | string;
  createdAt?: string;
};

export type ClientToServerAck = (res: any) => void;

export type ClientToServerEvents = {
  userOnline: (userId: SocketUserId, ack?: ClientToServerAck) => void;
  sendMessage: (payload: SendMessagePayload, ack?: (res: any) => void) => void;
  typing: (data: { receiverId: SocketUserId }, ack?: (res: { ok: boolean }) => void) => void;
  stopTyping: (data: { receiverId: SocketUserId }, ack?: (res: { ok: boolean }) => void) => void;
  messageDelivered: (
    data: { receiverId: SocketUserId; messageId?: string; clientMessageId?: string },
    ack?: (res: { ok: boolean }) => void
  ) => void;
  messageSeen: (
    data: { receiverId: SocketUserId; messageId?: string; clientMessageId?: string },
    ack?: (res: { ok: boolean }) => void
  ) => void;
};

export type ServerToClientEvents = {
  receiveMessage: (payload: ReceiveMessagePayload) => void;
  userOnline: (data: { userId: SocketUserId }) => void;
  userOffline: (data: { userId: SocketUserId }) => void;
  typing: (data: { userId: SocketUserId }) => void;
  stopTyping: (data: { userId: SocketUserId }) => void;
  messageDelivered: (
    data: { userId: SocketUserId; messageId?: string; clientMessageId?: string }
  ) => void;
  messageSeen: (
    data: { userId: SocketUserId; messageId?: string; clientMessageId?: string }
  ) => void;
};

