import { motion } from "framer-motion";
import {
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineStar,
  HiOutlineUserPlus,
  HiOutlineSparkles,
} from "react-icons/hi2";
import type { ConnectionsTab } from "./useConnectionsData";

interface TabsProps {
  active: ConnectionsTab;
  onChange: (tab: ConnectionsTab) => void;
  countFor: (tab: ConnectionsTab) => number;
}

const TABS: { key: ConnectionsTab; label: string; icon: React.ElementType }[] = [
  { key: "friends", label: "Friends", icon: HiOutlineUsers },
  // { key: "followers", label: "Followers", icon: HiOutlineUserGroup },
  // { key: "following", label: "Following", icon: HiOutlineStar },
  { key: "requests", label: "Requests", icon: HiOutlineUserPlus },
  { key: "suggestions", label: "Suggestions", icon: HiOutlineSparkles },
];

export default function Tabs({ active, onChange, countFor }: TabsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        const count = countFor(tab.key);

        return (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(tab.key)}
            className={`relative flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-medium transition ${
              isActive
                ? "text-white"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="connections-tab"
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-600/30"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}

            <Icon className="relative z-10 text-lg" />
            <span className="relative z-10">{tab.label}</span>

            {count > 0 && (
              <span
                className={`relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs ${
                  isActive
                    ? "bg-white/20"
                    : "bg-violet-500/20 text-violet-300"
                }`}
              >
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}