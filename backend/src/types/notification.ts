import { Types } from "mongoose";

/**
 * All supported notification types.
 *
 * The frontend uses this `type` value to render the correct icon and to build
 * the display text — the DB never stores a hardcoded message string. Adding a
 * new type only requires extending this union + the model enum + the
 * frontend's text/icon mapper.
 */
export type NotificationType =
  | "like_post"
  | "comment_post"
  | "reply_comment"
  | "follow"
  | "friend_removed"
  | "friend_request"
  | "friend_accept"
  | "mention"
  | "story_like"
  | "story_reply"
  | "message_reaction"
  | "message_request"
  | "voice_call"
  | "video_call"
  | "missed_call"
  | "post_tag"
  | "system";

/** The literal array mirrors the union — keep both in sync. */
export const NOTIFICATION_TYPES: readonly NotificationType[] = [
  "like_post",
  "comment_post",
  "reply_comment",
  "follow",
  "friend_request",
  "friend_accept",
  "mention",
  "story_like",
  "story_reply",
  "message_reaction",
  "message_request",
  "voice_call",
  "video_call",
  "missed_call",
  "post_tag",
  "system",
] as const;

/** Data required to create a notification (entity ids, no display message). */
export interface CreateNotificationInput {
  /** Who receives the notification. */
  recipient: Types.ObjectId | string;
  /** Who triggered the notification (actor). */
  sender?: Types.ObjectId | string;
  type: NotificationType;
  post?: Types.ObjectId | string;
  comment?: Types.ObjectId | string;
  story?: Types.ObjectId | string;
  message?: Types.ObjectId | string;
  conversation?: Types.ObjectId | string;
}

/** Query options for paginated `getNotifications`. */
export interface NotificationQueryOptions {
  page: number;
  limit: number;
}

/**
 * Shape of a populated notification as returned by `getNotifications`.
 * All referential fields are lean + selectively populated so the frontend can
 * render thumbnails, comment previews, etc. without extra round-trips.
 */
export interface PopulatedNotification {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender: {
    _id: Types.ObjectId;
    name: string;
    username: string;
    avatar?: string;
  } | null;
  type: NotificationType;
  read: boolean;
  status?: "pending" | "accepted" | "declined";
  post?: {
    _id: Types.ObjectId;
    media?: { url?: string }[];
  } | null;
  comment?: {
    _id: Types.ObjectId;
    text?: string;
  } | null;
  story?: {
    _id: Types.ObjectId;
    media?: string;
  } | null;
  message?: {
    _id: Types.ObjectId;
    text?: string;
    attachments?: string[];
  } | null;
  conversation?: {
    _id: Types.ObjectId;
    participants?: Types.ObjectId[];
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
