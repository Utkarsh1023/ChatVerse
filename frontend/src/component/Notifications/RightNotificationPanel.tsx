import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineBell,
  HiOutlineUserPlus,
  HiOutlineCog6Tooth,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

const activities = [
  {
    title: "Unread Notifications",
    value: "18",
    color: "text-cyan-400",
  },
  {
    title: "Friend Requests",
    value: "12",
    color: "text-emerald-400",
  },
  {
    title: "Mentions",
    value: "7",
    color: "text-violet-400",
  },
];

const items = [
  { key: "push", title: "Push Notifications" },
  { key: "email", title: "Email Notifications" },
  { key: "desktop", title: "Desktop Notifications" },
  { key: "friendRequests", title: "Friend Request Alerts" },
] as const;

export default function RightNotificationPanel() {
  const [settings, setSettings] = useState({
    push: true,
    email: false,
    desktop: true,
    friendRequests: true,
  });

  type SettingKey = keyof typeof settings;

  const toggle = (key: SettingKey) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <aside className="w-[340px] border-l border-white/10 bg-slate-900/60 backdrop-blur-xl">
      <div className="h-screen overflow-y-auto p-5 space-y-2">

        {/* Activity Summary */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
        >
          <div className="mb-5 flex items-center gap-2">
            <HiOutlineBell className="text-xl text-violet-400" />
            <h3 className="font-semibold text-white">
              Activity Summary
            </h3>
          </div>

          <div className="space-y-4">
            {activities.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-slate-300">
                  {item.title}
                </span>

                <span className={`font-semibold ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Friend Requests */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-5 flex items-center gap-2">
            <HiOutlineUserPlus className="text-xl text-emerald-400" />

            <h3 className="font-semibold text-white">
              Pending Requests
            </h3>
          </div>

          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={{ x: 4 }}
              className="mb-4 flex items-center justify-between last:mb-0"
            >
              <div className="flex items-center gap-3">
                <img
                  src={`https://i.pravatar.cc/150?img=${20 + i}`}
                  className="h-10 w-10 rounded-full"
                  alt=""
                />

                <div>
                  <p className="text-sm font-medium text-white">
                    User {i}
                  </p>

                  <p className="text-xs text-slate-400">
                    Wants to connect
                  </p>
                </div>
              </div>

              <button className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400 transition hover:bg-emerald-500 hover:text-white">
                <HiOutlineCheckCircle />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Notification Settings */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">

          <div className="mb-5 flex items-center gap-2">
            <HiOutlineCog6Tooth className="text-xl text-cyan-400" />

            <h3 className="font-semibold text-white">
              Notification Settings
            </h3>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-slate-300">
                  {item.title}
                </span>

                <Toggle
                  checked={settings[item.key]}
                  onChange={() => toggle(item.key)}
                />
              </div>
            ))}
          </div>

        </div>

      </div>
    </aside>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
        checked ? "bg-violet-600" : "bg-slate-700"
      }`}
    >
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}