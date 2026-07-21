import { motion } from "framer-motion";
import {
  FiMessageCircle,
  FiImage,
  FiUsers,
  FiFolder,
  FiAward,
} from "react-icons/fi";

const activities = [
  {
    icon: FiMessageCircle,
    title: "Sent 24 new messages",
    description: "Active in the MERN Developers group.",
    time: "5 min ago",
    color: "bg-violet-500",
    glow: "shadow-violet-500/30",
  },
  {
    icon: FiImage,
    title: "Updated profile picture",
    description: "Changed your avatar successfully.",
    time: "2 hours ago",
    color: "bg-pink-500",
    glow: "shadow-pink-500/30",
  },
  {
    icon: FiUsers,
    title: "Joined UI/UX Community",
    description: "You became a member of the UI Designers group.",
    time: "Yesterday",
    color: "bg-sky-500",
    glow: "shadow-sky-500/30",
  },
  {
    icon: FiFolder,
    title: "Uploaded 12 project files",
    description: "Shared files with your teammates.",
    time: "2 days ago",
    color: "bg-emerald-500",
    glow: "shadow-emerald-500/30",
  },
  {
    icon: FiAward,
    title: "Achievement unlocked",
    description: "Reached 5,000 total messages.",
    time: "Last Week",
    color: "bg-amber-500",
    glow: "shadow-amber-500/30",
  },
];

export default function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mt-2 rounded-[32px] border border-slate-700 bg-[#0F172A] p-8 backdrop-blur-3xl shadow-[0_0_35px_rgba(168,85,247,.12)]"
    >
      <h2 className="mb-8 text-2xl font-bold text-slate-100">
        Recent Activity
      </h2>

      <div className="relative">

        {/* Timeline Line */}
        <div className="absolute left-6 top-0 h-full w-[2px] bg-gradient-to-b from-fuchsia-500 via-cyan-500 to-transparent" />

        <div className="space-y-8">
          {activities.map((activity, index) => {
            const Icon = activity.icon;

            return (
              <motion.div
                key={activity.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.1,
                }}
                whileHover={{
                  x: 6,
                  y: -2,
                  scale: 1.01,
                }}
                className="relative flex gap-6"
              >
                {/* Timeline Icon */}
                <div
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${activity.color} text-white shadow-[0_0_20px_rgba(0,0,0,.35)]`}
                >
                  <Icon size={20} />
                </div>

                {/* Card */}
                <div className="flex-1 rounded-3xl border border-slate-700 bg-slate-800 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:bg-slate-700 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-100">
                      {activity.title}
                    </h3>

                    <span className="text-sm text-slate-500">
                      {activity.time}
                    </span>
                  </div>

                  <p className="mt-2 leading-7 text-slate-400">
                    {activity.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}