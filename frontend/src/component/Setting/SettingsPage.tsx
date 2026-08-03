import { useMemo, useState } from "react";
import {Link} from "react-router-dom"
import SettingsSidebar from "./SettingsSidebar";
import {HiOutlineArrowLeft} from "react-icons/hi"
import { AnimatePresence, motion } from "framer-motion";
import AccountSettings from "./AccountSettings";
import AppearanceSettings from "./AppearanceSettings";
import NotificationSettings from "./NotificationSettings";
import PrivacySettings from "./PrivacySettings";
import SecuritySettings from "./SecuritySettings";
import DangerZone from "./DangerZone";
import ContactSupport from "./ContactSupport";
import { HiOutlineUser, HiOutlinePaintBrush, HiOutlineBell, HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineQuestionMarkCircle, HiOutlineExclamationTriangle, HiOutlineComputerDesktop, } from "react-icons/hi2";
import { MdOutlineLogout  } from "react-icons/md";
import MobileBottomNav from "../layouts/MobileBottomNav";

type SettingTab =
  | "account"
  | "appearance"
  | "notifications"
  | "privacy"
  | "security"
  | "danger"
  | "contact"

  const mobileIcons = [
  {
    id: "account",
    icon: HiOutlineUser,
  },
  {
    id: "appearance",
    icon: HiOutlinePaintBrush,
  },
  {
    id: "notifications",
    icon: HiOutlineBell,
  },
  {
    id: "privacy",
    icon: HiOutlineShieldCheck,
  },
  {
    id: "security",
    icon: HiOutlineLockClosed,
  },
  {
    id: "danger",
    icon: HiOutlineExclamationTriangle,
  },
  {
    id: "contact",
    icon: HiOutlineQuestionMarkCircle,
  },
];
export default function SettingsPage() {
  // requested state
  const [settingSidebar, setSettingSidebar] = useState<SettingTab>(
    "account"
  );

  const content = useMemo(() => {
    switch (settingSidebar) {
      case "account":
        return <AccountSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "privacy":
        return <PrivacySettings />;
      case "security":
        return <SecuritySettings />;
      case "danger":
        return <DangerZone />
      case "contact":
        return <ContactSupport />
      default:
        return <AccountSettings  />;
    }
  }, [settingSidebar]);

  return (
  <div className="h-screen overflow-hidden bg-[#0F172A]">
    <div className="mx-auto flex h-full max-w-8xl flex-col px-3 py-3 sm:px-4">

      {/* Header */}
<div className="mb-3 shrink-0 rounded-3xl border border-slate-700 bg-[#0F172A] p-4 shadow-[0_0_30px_rgba(168,85,247,.12)] sm:p-6">

  <div className="flex w-full items-center justify-between gap-4">

    {/* Left Side */}
    <div className="flex min-w-0 items-center gap-2">

      <Link
        to="/dashboard"
        className="
          group
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-2xl
          border
          border-white/10
          bg-slate-800/70
          text-slate-300
          backdrop-blur-xl
          transition-all
          duration-300
          hover:-translate-x-1
          hover:border-fuchsia-500/30
          hover:bg-gradient-to-br
          hover:from-fuchsia-600
          hover:to-cyan-500
          hover:text-white
          hover:shadow-[0_0_20px_rgba(168,85,247,.35)]
          sm:h-12
          sm:w-12
        "
      >
        <HiOutlineArrowLeft className="text-xl transition-transform duration-300 group-hover:-translate-x-1" />
      </Link>

      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">
          Settings
        </h1>

        <p className="mt-1 hidden text-sm text-slate-400 md:block">
          Manage your account, privacy and preferences
        </p>
      </div>

    </div>

    {/* Right Side */}
    <motion.button
      whileHover={{
        scale: 1.04,
        y: -2,
      }}
      whileTap={{
        scale: 0.96,
      }}
      className="
        flex
        shrink-0
        items-center
        gap-2
        rounded-2xl
        bg-gradient-to-r
        from-rose-500
        to-red-600
        px-5
        py-3
        font-semibold
        text-white
        shadow-[0_8px_25px_rgba(239,68,68,.25)]
        transition-all
        duration-300
        hover:shadow-[0_0_35px_rgba(239,68,68,.45)]
      "
    >
      <MdOutlineLogout  className=" text-lg" />

      <span className="hidden sm:block">
        Log Out
      </span>
    </motion.button>
    

  </div>
<div className="mt-4 flex items-center justify-between gap-2 overflow-x-auto pb-2 md:hidden">
  {mobileIcons.map((item) => {
    const Icon = item.icon;
    const isActive = settingSidebar === item.id;

    return (
      <motion.button
        key={item.id}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSettingSidebar(item.id as SettingTab)}
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          transition-all
          duration-300

          ${
            isActive
              ? "bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(168,85,247,.35)]"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
          }
        `}
      >
        <Icon size={22} />
      </motion.button>
    );
  })}
</div>
</div>
      {/* Sidebar + Content */}
      <div className="grid flex-1 gap-2 overflow-hidden md:grid-cols-[250px_1fr] lg:grid-cols-[280px_1fr]">

        {/* Sidebar */}
        <div className="hidden h-full overflow-hidden md:block">
          <SettingsSidebar
            active={settingSidebar}
            setActive={(tab: string) =>
              setSettingSidebar(tab as SettingTab)
            }
          />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={settingSidebar}
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.98,
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            className="h-full overflow-y-auto px-1 sm:px-2"
          >
            {content}
          </motion.div>
        </AnimatePresence>

      </div>

    </div>
    <MobileBottomNav />
  </div>
);
}

