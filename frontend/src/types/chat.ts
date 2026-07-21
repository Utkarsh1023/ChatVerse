export type SocketUserId = string;

export type MessageStatus = "sent" | "delivered" | "seen";

export type Attachment = { url: string; filename?: string };

export type ChatMessage = {
  id: string;
  conversationId?: string;
  senderId: SocketUserId;
  receiverId: SocketUserId;
  text?: string;
  attachments?: Attachment[];
  status?: MessageStatus;
  edited?: boolean;
  deleted?: boolean;
  createdAt?: string;
};

