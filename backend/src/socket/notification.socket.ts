/**
 * Notification {@link https://socket.io | Socket.IO} helpers.
 *
 * Every helper is a safe no-op when Socket.IO has not been initialised (e.g.
 * during tests or cold starts) — the server just degrades to REST-only
 * notification flow.
 *
 * All events are scoped to the recipient's personal room (`user:{id}`), which
 * is the same room used by the rest of the app (friend requests, chat, etc.).
 */
import { getIO } from "./socket";
import Notification from "../models/Notification";

/** Event sent when a brand-new notification is created for a recipient. */
export const emitNewNotification = (
  recipientId: string,
  notification: unknown
): void => {
  const io = getIO();
  if (!io) return;
  io.to(`user:${recipientId}`).emit("notification:new", notification);
};

/** Event sent when a single notification is marked as read. */
export const emitNotificationRead = (
  recipientId: string,
  notificationId: string
): void => {
  const io = getIO();
  if (!io) return;
  io.to(`user:${recipientId}`).emit("notification:read", { notificationId });
};

/** Event sent when a single notification is deleted. */
export const emitNotificationDelete = (
  recipientId: string,
  notificationId: string
): void => {
  const io = getIO();
  if (!io) return;
  io.to(`user:${recipientId}`).emit("notification:delete", { notificationId });
};

/** Event sent when ALL of a recipient's notifications are marked read. */
export const emitReadAll = (recipientId: string): void => {
  const io = getIO();
  if (!io) return;
  io.to(`user:${recipientId}`).emit("notification:read-all", {});
};

/** Event carrying the latest unread badge count. */
export const emitUnreadCount = async (
  recipientId: string
): Promise<void> => {
  const io = getIO();
  if (!io) return;

  const unreadCount = await Notification.countDocuments({
    recipient: recipientId,
    read: false,
  });

  io.to(`user:${recipientId}`).emit(
    "notification:unread-count",
    {
      unreadCount,
    }
  );
};

