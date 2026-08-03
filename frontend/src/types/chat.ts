export type SocketUserId = string;

export type Conversation = {
  _id: string;
  updatedAt?: string;
  lastMessage?: {
    _id?: string;
    text?: string;
    senderId?: string;
    receiverId?: string;
    createdAt?: string;
  } | null;
  user?: {
    _id: string;
    name: string;
    username?: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: string;
    isVerified?: boolean;
  } | null;
};

export type MessageStatus = "sent" | "delivered" | "seen";

export type Attachment = {
  url: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  public_id?: string;
};

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

