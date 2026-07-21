import { motion } from "framer-motion";
import {
  HiOutlineUser,
  HiOutlinePaintBrush,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineQuestionMarkCircle,
  HiOutlineExclamationTriangle,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";

interface SidebarProps {
  active: string;
  setActive: (tab: string) => void;
}

const menuItems = [
  {
    id: "account",
    label: "Account",
    icon: HiOutlineUser,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: HiOutlinePaintBrush,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: HiOutlineBell,
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: HiOutlineShieldCheck,
  },
  {
    id: "security",
    label: "Security",
    icon: HiOutlineLockClosed,
  },
  {
    id: "danger",
    label: "Danger Zone",
    icon: HiOutlineExclamationTriangle,
  },
  {
    id: "contact",
    label: "Contact Support",
    icon: HiOutlineQuestionMarkCircle,
  },
];

export default function SettingsSidebar({
  active,
  setActive,
}: SidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -25 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="
        sticky
        h-full
        top-4
        rounded-3xl
        border
        border-white/10
        bg-[#0F172A]
        p-6
        backdrop-blur-2xl
        shadow-[0_0_40px_rgba(168,85,247,.12)]
      "
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-4 justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-cyan-500 text-white shadow-lg">
            <HiOutlineComputerDesktop size={24} />
          </div> 

          <div>
            <h2 className="text-xl font-bold text-white">
              Settings
            </h2>

            {/* <p className="text-sm text-slate-400">
              Personalize your experience
            </p> */}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 6 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActive(item.id)}
              className={`
                group
                relative
                flex
                w-full
                items-center
                gap-4
                overflow-hidden
                rounded-2xl
                border
                px-4
                py-3
                transition-all
                duration-300
                ${
                  isActive
                    ? "border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/10 shadow-[0_0_25px_rgba(168,85,247,.18)]"
                    : "border-transparent hover:border-slate-700 hover:bg-slate-800/70"
                }
              `}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-fuchsia-500 to-cyan-400"
                />
              )}

              {/* Icon */}
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-fuchsia-600 to-cyan-500 text-white shadow-lg"
                    : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"
                }`}
              >
                <Icon size={21} />
              </div>

              {/* Label */}
              <div className="flex-1 text-left">
                <h4
                  className={`font-semibold transition ${
                    isActive ? "text-white" : "text-slate-300"
                  }`}
                >
                  {item.label}
                </h4>

                <p className="mt-0.5 text-xs text-slate-500">
                  Configure settings
                </p>
              </div>

              {/* Active Dot */}
              {isActive && (
                <motion.div
                  layoutId="activeDot"
                  className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,.8)]"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.aside>
  );
}