import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { AuthRequest } from "../middleware/verifyToken";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} from "../services/notification.service";

/** Resolve the authenticated user id from either convention used in this repo. */
const getUserId = (req: AuthRequest): string => {
  const id = req.user?.id || req.userId;
  if (!id) {
    throw new ApiError(401, "Unauthorized");
  }
  return id;
};

/**
 * GET /api/notifications
 * Paginated, newest-first list with populated sender + entity thumbnails.
 * Also returns the unread count so the badge refreshes on every load.
 */
export const getNotificationsController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);

    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;
    const pageStr = Array.isArray(pageRaw)
      ? String(pageRaw[0])
      : String(pageRaw ?? "1");
    const limitStr = Array.isArray(limitRaw)
      ? String(limitRaw[0])
      : String(limitRaw ?? "20");

    const page = Math.max(1, parseInt(pageStr, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(limitStr, 10) || 20));

    // const data = await getNotifications(myId, { page, limit });

    // return res.status(200).json({
    //   success: true,
    //   message: "Notifications fetched",
    //   data: {
    //     notifications: data.notifications,
    //     unreadCount: data.unreadCount,
    //     pagination: {
    //       page,
    //       limit,
    //       hasMore: data.hasMore,
    //     },
    //   },
    // });
    const data = await getNotifications(myId, { page, limit });

console.log("========== NOTIFICATIONS ==========");
console.log(data.notifications);
console.log("Unread Count:", data.unreadCount);
console.log("===================================");

return res.status(200).json({
  success: true,
  message: "Notifications fetched",
  data: {
    notifications: data.notifications,
    unreadCount: data.unreadCount,
    pagination: {
      page,
      limit,
      hasMore: data.hasMore,
    },
  },
});
  }
);

/**
 * GET /api/notifications/unread-count
 * Returns just the unread badge count.
 */
export const getUnreadCountController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const unreadCount = await getUnreadCount(myId);

    return res.status(200).json({
      success: true,
      message: "Unread count fetched",
      data: { unreadCount },
    });
  }
);

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read (owner only).
 */
export const markReadController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const { id } = req.params;
    const notificationId = Array.isArray(id) ? String(id[0]) : String(id);

    await markRead(myId, notificationId);

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: { notificationId },
    });
  }
);

/**
 * PATCH /api/notifications/read-all
 * Mark ALL of the recipient's notifications as read.
 */
export const markAllReadController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);

    await markAllRead(myId);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  }
);

/**
 * DELETE /api/notifications/:id
 * Delete a notification (owner only).
 */
export const deleteNotificationController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const { id } = req.params;
    const notificationId = Array.isArray(id) ? String(id[0]) : String(id);

    await deleteNotification(myId, notificationId);

    return res.status(200).json({
      success: true,
      message: "Notification deleted",
      data: { notificationId },
    });
  }
);
