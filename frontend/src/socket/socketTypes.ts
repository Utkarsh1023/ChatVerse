export type SocketUserId = string;

export type Attachment = {
  url: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  public_id?: string;
};

export type SendMessagePayload = {
  id?: string;
    senderId: string;
    receiverId: string;
    conversationId?: string;
    text?: string;
    attachments?: Attachment[];
    status?: "sent" | "delivered" | "seen";
    createdAt?: string;
    clientMessageId?: string;
};

export type MessageStatus = "sent" | "delivered" | "seen";

export type ReceiveMessagePayload = SendMessagePayload & {
  id?: string;
  status?: MessageStatus | string;
  createdAt?: string;
};

export type ClientToServerAck = (res: any) => void;

/** Minimal user shape sent over socket for friend-request events. */
export type FriendRequestUser = {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: string;
};

export type ClientToServerEvents = {
  userOnline: (userId: SocketUserId, ack?: ClientToServerAck) => void;
  join: () => void;
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
  deleteMessage: (
    data: { messageId: string; conversationId?: string },
    ack?: (res: { ok: boolean }) => void
  ) => void;
  messagesSeen: (data: { conversationId: string }) => void;
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
  messageDeleted: (data: {
    userId?: SocketUserId;
    messageId?: string;
    conversationId?: string;
  }) => void;
  messagesSeen: (data: {
    userId?: SocketUserId;
    conversationId?: string;
    messageIds?: string[];
  }) => void;
friendRequestReceived: (data: {
    request: FriendRequestUser;
    count: number;
  }) => void;
  friendRequestAccepted: (data: { friend: FriendRequestUser }) => void;
  friendRequestRejected: (data: { userId: SocketUserId }) => void;

  // Post-action friend request events (accept/decline)
  friendAccepted: (data: { friend: FriendRequestUser; by: string }) => void;
  friendDeclined: (data: { userId: SocketUserId }) => void;
  "friend:accepted": (data: { friend: FriendRequestUser; by: string }) => void;
  "friend:declined": (data: { userId: SocketUserId }) => void;

  // Notification status update (single notification, no full refetch)
  "notification:updated": (notification: Record<string, unknown>) => void;

// Friends Dashboard real-time events
  friendOnline: (data: { userId: SocketUserId }) => void;
  friendOffline: (data: { userId: SocketUserId }) => void;
  friendRemoved: (data: { removedBy: string; userId: string }) => void;
  requestReceived: (data: {
    request: FriendRequestUser;
    count: number;
  }) => void;
  friendsUpdated: (data?: { userId?: string }) => void;

  // Connections (follow) real-time events
  newFollower: (data: { follower: FriendRequestUser; count: number }) => void;
  unfollowed: (data: { userId: SocketUserId }) => void;
  followerRemoved: (data: { removedBy: SocketUserId }) => void;
  followingUpdated: (data?: { userId?: SocketUserId }) => void;
  followersUpdated: (data?: { userId?: SocketUserId }) => void;
  profileUpdated: (data: {
    userId: SocketUserId;
    profile: Partial<FriendRequestUser> | null;
  }) => void;
};
