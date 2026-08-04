import mongoose, { Types } from "mongoose";
import Notification from "../models/Notification";
import type { INotification } from "../models/Notification";
import ApiError from "../utils/ApiError";
import {
  CreateNotificationInput,
  NotificationQueryOptions,
} from "../types/notification";
import {
  emitNewNotification,
  emitNotificationRead,
  emitNotificationDelete,
  emitReadAll,
  emitUnreadCount,
} from "../socket/notification.socket";

/** Fields populated on the sender for rendering. */
const SENDER_SELECT = "name username avatar";

/**
 * Create a notification for a recipient and emit it in real time.
 *
 * The caller passes STRUCTURED data (`type`, `sender`, `recipient`, and
 * optional entity references) — never a display message. The frontend builds
 * the display text from the `type` + populated sender.
 */
export const createNotification = async (
  input: CreateNotificationInput
): Promise<INotification | null> => {
  const { recipient, sender, type, post, comment, story, message, conversation } =
    input;

  if (!mongoose.Types.ObjectId.isValid(String(recipient))) {
    throw new ApiError(400, "Invalid notification recipient");
  }

  // Don't notify a user about their own action.
  if (sender && String(sender) === String(recipient)) {
    return null;
  }

  const notification = await Notification.create({
  recipient,
  sender,
  type,
  post,
  comment,
  story,
  message,
  conversation,
});

  // Real-time: push to the recipient's room + refresh their unread badge.
  const populated = await Notification.findById(
    notification._id
)
.populate("sender", SENDER_SELECT)
.populate("post","media")
.populate("comment","text")
.populate("story","media")
.populate("message","text attachments")
.populate("conversation","participants")
.lean();

emitNewNotification(
    String(recipient),
    populated
);
  await emitUnreadCount(String(recipient));

  return notification;
};

/**
 * Return a single owned notification (recipient-scoped) or null.
 * This prevents users from reading/deleting someone else's notification.
 */
const findOwnedNotification = async (
  recipientId: string,
  notificationId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification id");
  }

  return Notification.findOne({
    _id: notificationId,
    recipient: recipientId,
  });
};

/** Delete a notification (owner only). */
export const deleteNotification = async (
  recipientId: string,
  notificationId: string
): Promise<void> => {
  const notification = await findOwnedNotification(recipientId, notificationId);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  await notification.deleteOne();

  emitNotificationDelete(recipientId, notificationId);
  await emitUnreadCount(recipientId);
};

/** Mark a single notification as read (owner only). */
export const markRead = async (
  recipientId: string,
  notificationId: string
): Promise<void> => {
  const notification = await findOwnedNotification(recipientId, notificationId);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (!notification.read) {
    notification.read = true;
    await notification.save();
  }

  emitNotificationRead(recipientId, notificationId);
  await emitUnreadCount(recipientId);
};

/** Mark all of a recipient's notifications as read. */
export const markAllRead = async (recipientId: string): Promise<void> => {
  await Notification.updateMany(
    { recipient: recipientId, read: false },
    { read: true }
  );

  emitReadAll(recipientId);
  await emitUnreadCount(recipientId);
};

/**
 * Paginated "latest activity" feed for a recipient, newest first.
 * Populates sender + optional entity thumbnails/text. Uses `.lean()` for
 * performance (no document hydration overhead).
 */
export const getNotifications = async (
  recipientId: string,
  options: NotificationQueryOptions
): Promise<{
  notifications: Record<string, unknown>[];
  unreadCount: number;
  hasMore: boolean;
}> => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [docs, unreadCount, total] = await Promise.all([
    Notification.find({ recipient: recipientId })
      .sort({ createdAt: -1, _id:-1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", SENDER_SELECT)
      .populate("post", "media")
      .populate("comment", "text")
      .populate("story", "media")
      .populate("message", "text attachments")
      .populate("conversation", "participants")
      .lean(),
    Notification.countDocuments({ recipient: recipientId, read: false }),
    Notification.countDocuments({ recipient: recipientId }),
  ]);

  return {
    notifications: docs as unknown as Record<string, unknown>[],
    unreadCount,
    hasMore: skip + docs.length < total,
  };
};

/** Unread count for the badge. */
export const getUnreadCount = async (recipientId: string): Promise<number> => {
  return Notification.countDocuments({
    recipient: recipientId,
    read: false,
  });
};

export type { INotification };
