import NotificationItem from "./NotificationItem";
import { useEffect, useState } from "react";
import { getNotifications,markAllNotificationsRead, deleteNotification } from "../../api/notifications";
import { socket } from "../../socket";

export default function NotificationsList() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        console.log("Notifications API:", data);
        console.log("Notifications:", data.notifications);
        setNotifications(data.notifications);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
  socket.on("notification:new", (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  });

  socket.on("notification:read", ({ notificationId }) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  });

  socket.on("notification:delete", ({ notificationId }) => {
    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          notification._id !== notificationId
      )
    );
  });

  socket.on("notification:read-all", () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  });
  socket.on(
    "notification:unread-count",
    ({ unreadCount }) => {
      setUnreadCount(unreadCount);
    }
  );

  return () => {
    socket.off("notification:new");
    socket.off("notification:read");
    socket.off("notification:delete");
    socket.off("notification:read-all");
    socket.off("notification:unread-count");
  };
}, []);

  const grouped = {
    today: [] as any[],
    yesterday: [] as any[],
    earlier: [] as any[],
  };

  notifications.forEach((notification) => {
    const created = new Date(notification.createdAt);
    const now = new Date();

    const diff =
      (now.getTime() - created.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff < 1) {
      grouped.today.push(notification);
    } else if (diff < 2) {
      grouped.yesterday.push(notification);
    } else {
      grouped.earlier.push(notification);
    }
  });

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-400">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <NotificationSection
        title="Today"
        notifications={grouped.today}
      />

      <NotificationSection
        title="Yesterday"
        notifications={grouped.yesterday}
      />

      <NotificationSection
        title="Earlier"
        notifications={grouped.earlier}
      />
    </div>
  );
}

  interface SectionProps {
    title: string;
    notifications: any[];
  }

function NotificationSection({
  title,
  notifications,
}: SectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        <span className="text-sm text-slate-500">
          {notifications.length} notifications
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
        {notifications.map((item: any, index: number) => (
          <div
            key={item._id}
            className={
              index !== notifications.length - 1
                ? "border-b border-white/5"
                : ""
            }
          >
            <NotificationItem
              avatar={item.sender?.avatar}
              name={item.sender?.name}
              username={item.sender?.username}
              comment={item.comment?.text}
              time={item.createdAt}
              unread={!item.read}
              type={item.type}
              postImage={item.post?.media}
            />
          </div>
        ))}
      </div>
    </section>
  );
}