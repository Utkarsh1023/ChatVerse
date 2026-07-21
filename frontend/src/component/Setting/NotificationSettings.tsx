import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineBell,
  HiOutlineComputerDesktop,
  HiOutlineEnvelope,
  HiOutlineSpeakerWave,
  HiOutlineUserGroup,
  HiOutlineChatBubbleLeftRight,
  HiOutlineEye,
  HiOutlineSignal,
} from "react-icons/hi2";

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onChange}
      className={`relative h-8 w-16 rounded-full transition-all duration-300 ${
        checked
          ? "bg-gradient-to-r from-fuchsia-500 to-cyan-500"
          : "bg-slate-700"
      }`}
    >
      <motion.div
        animate={{
          x: checked ? 32 : 4,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,.35)]"
      />
    </motion.button>
  );
};

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    desktop: true,
    email: false,
    sound: true,
    group: true,
    typing: true,
    receipts: true,
    online: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const options = [
    {
      key: "desktop",
      title: "Desktop Notifications",
      description: "Receive browser notifications.",
      icon: <HiOutlineComputerDesktop size={24} />,
    },
    {
      key: "email",
      title: "Email Notifications",
      description: "Receive updates via email.",
      icon: <HiOutlineEnvelope size={24} />,
    },
    {
      key: "sound",
      title: "Message Sound",
      description: "Play sound for new messages.",
      icon: <HiOutlineSpeakerWave size={24} />,
    },
    {
      key: "group",
      title: "Group Notifications",
      description: "Notifications from group chats.",
      icon: <HiOutlineUserGroup size={24} />,
    },
    {
      key: "typing",
      title: "Typing Indicator",
      description: "Show when you're typing.",
      icon: <HiOutlineChatBubbleLeftRight size={24} />,
    },
    {
      key: "online",
      title: "Online Status",
      description: "Show your online presence.",
      icon: <HiOutlineSignal size={24} />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
className="rounded-2xl border border-slate-700 bg-slate-800 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:bg-slate-900 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]"    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/10 p-3">
          <HiOutlineBell className="text-fuchsia-400" size={28} />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white">
            Notification Settings
          </h2>

          <p className="text-slate-400">
            Manage how you receive notifications.
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {options.map((item) => (
          <motion.div
            key={item.key}
    whileHover={{
      scale: 1.03,
      y: -5,
    }}
    className="rounded-2xl border border-slate-700 bg-slate-800 p-6 transition-all duration-300 hover:border-fuchsia-500/30 hover:bg-slate-700 hover:shadow-[0_0_20px_rgba(168,85,247,.15)]"
  >
    {/* Top */}
    <div className="flex items-center justify-between">
      <div className="rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/10 p-3 text-fuchsia-400">
        {item.icon}
      </div>

      <Toggle
        checked={settings[item.key as keyof typeof settings]}
        onChange={() =>
          toggle(item.key as keyof typeof settings)
        }
      />
    </div>

    {/* Content */}
    <div className="mt-5">
      <h3 className="text-lg font-semibold text-white">
        {item.title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {item.description}
      </p>
    </div>

            
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex w-full items-center justify-center gap-3">
  <motion.button
    whileHover={{
      scale: 1.03,
      boxShadow: "0 0 30px rgba(168,85,247,.45)",
    }}
    whileTap={{ scale: 0.98 }}
    className="
      flex-1
      rounded-2xl
      bg-gradient-to-r
      from-fuchsia-600
      to-cyan-500
      px-4
      py-3
      text-sm
      font-semibold
      text-white
      shadow-lg
      transition-all
      duration-300
      hover:shadow-[0_0_25px_rgba(168,85,247,.45)]
      sm:flex-none
      sm:px-8
      sm:text-base
    "
  >
    Save Changes
  </motion.button>

  <motion.button
    whileHover={{
      scale: 1.03,
      boxShadow: "0 0 20px rgba(71,85,105,.35)",
    }}
    whileTap={{ scale: 0.98 }}
    className="
      flex-1
      rounded-2xl
      border
      border-slate-700
      bg-slate-800
      px-4
      py-3
      text-sm
      font-semibold
      text-slate-300
      transition-all
      duration-300
      hover:border-slate-600
      hover:bg-slate-700
      hover:text-white
      sm:flex-none
      sm:px-8
      sm:text-base
    "
  >
    Reset
  </motion.button>
</div>
      
    </motion.div>
  );
}