import NotificationCard from "./NotificationCard";

const notifications = {
  today: [
    {
      id: 1,
      avatar: "https://i.pravatar.cc/300?img=32",
      name: "Prachi Dubey",
      username: "prachi",
      message: "liked your latest post ❤️",
      time: "2 minutes ago",
      unread: true,
      type: "like",
    },
    {
      id: 2,
      avatar: "https://i.pravatar.cc/300?img=15",
      name: "Rahul Sharma",
      username: "rahul",
      message: "commented: Amazing UI! 🔥",
      time: "15 minutes ago",
      unread: true,
      type: "comment",
    },
    {
      id: 3,
      avatar: "https://i.pravatar.cc/300?img=11",
      name: "Aman Kumar",
      username: "aman",
      message: "sent you a friend request.",
      time: "45 minutes ago",
      unread: true,
      type: "request",
    },
  ],

  yesterday: [
    {
      id: 4,
      avatar: "https://i.pravatar.cc/300?img=25",
      name: "Ananya Singh",
      username: "ananya",
      message: "mentioned you in a comment.",
      time: "Yesterday • 8:20 PM",
      unread: false,
      type: "mention",
    },
    {
      id: 5,
      avatar: "https://i.pravatar.cc/300?img=44",
      name: "Sneha Verma",
      username: "sneha",
      message: "started a video call with you.",
      time: "Yesterday • 5:10 PM",
      unread: false,
      type: "video",
    },
  ],

  earlier: [
    {
      id: 6,
      avatar: "https://i.pravatar.cc/300?img=52",
      name: "System",
      username: "premiumchat",
      message: "Your account security has been updated.",
      time: "2 days ago",
      unread: false,
      type: "system",
    },
    {
      id: 7,
      avatar: "https://i.pravatar.cc/300?img=55",
      name: "Riya Gupta",
      username: "riya",
      message: "missed your voice call.",
      time: "3 days ago",
      unread: false,
      type: "call",
    },
    {
      id: 8,
      avatar: "https://i.pravatar.cc/300?img=68",
      name: "Nikhil Raj",
      username: "nikhil",
      message: "liked your portfolio project.",
      time: "Last Week",
      unread: false,
      type: "like",
    },
  ],
};

export default function NotificationsList() {
  return (
    <div className="space-y-10">
      <NotificationSection
        title="Today"
        notifications={notifications.today}
      />

      <NotificationSection
        title="Yesterday"
        notifications={notifications.yesterday}
      />

      <NotificationSection
        title="Earlier"
        notifications={notifications.earlier}
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
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>

        <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-400">
          {notifications.length} Notifications
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 2xl:grid-cols-3">
        {notifications.map((item) => (
          <NotificationCard
            key={item.id}
            avatar={item.avatar}
            name={item.name}
            username={item.username}
            message={item.message}
            time={item.time}
            unread={item.unread}
            type={item.type}
          />
        ))}
      </div>
    </section>
  );
}