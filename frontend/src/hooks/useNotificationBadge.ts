import { useEffect, useState, useCallback } from "react";
import { getUnreadCount, markAllNotificationsRead } from "../api/notifications";
import { socket } from "../socket";

/**
 * Shared hook for the notification badge.
 *
 * - Fetches the initial unread count from the backend.
 * - Listens to the real-time `notification:unread-count` socket event so the
 *   badge increments when a new notification arrives and decrements when the
 *   user reads/clears notifications on any device.
 * - Exposes `clearBadge()` to mark all notifications as read and reset the
 *   count to 0 (used when the user opens the notifications page).
 */
export function useNotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  // Load initial unread count.
  useEffect(() => {
    let mounted = true;
    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        if (mounted) setUnreadCount(count);
      } catch (err) {
        console.error("Failed to load unread notification count:", err);
      }
    };

    loadUnreadCount();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen to real-time unread-count updates from the backend.
  useEffect(() => {
    const onUnreadCount = ({ unreadCount }: { unreadCount: number }) => {
      setUnreadCount(unreadCount);
    };

    socket.on("notification:unread-count", onUnreadCount);

    return () => {
      socket.off("notification:unread-count", onUnreadCount);
    };
  }, []);

  // Mark all notifications as read and reset the badge to 0.
  const clearBadge = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  }, []);

  return { unreadCount, clearBadge };
}
