import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import {Link} from "react-router-dom";
import type { User } from "../../types/user";
import { useAuth } from "../../context/AuthContext";

import {
  HiOutlinePhoto,
  HiOutlineUsers,
  HiOutlineStar,
  HiOutlineTrash,
  HiOutlineNoSymbol,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
} from "react-icons/hi2";
import { FaRegBellSlash } from "react-icons/fa6";
import { BsChatSquareHeartFill } from "react-icons/bs";

type Props = {
  open: boolean;
  onClose: () => void;
  user?: User;
};

function SectionHeading({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="flex items-center gap-2 text-white font-semibold">
        <span className="text-cyan-400">{icon}</span>
        {title}
      </h3>
      {right}
    </div>
  );
}

export default function RightSidebarDrawer({ open, onClose, user, }: Props) {
  
  return (
    <AnimatePresence>
  {open && (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed h-full inset-0 z-40 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />

      {/* One Sidebar for all devices */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
          duration: 0.35,
          ease: "easeInOut",
        }}
        className="
          fixed
          top-0
          right-0
          z-50
          h-screen
          bg-slate-900/80
          backdrop-blur-xl
          border-l
          border-white/10
          shadow-2xl

          w-full
          sm:w-[380px]
          lg:w-[360px]
        "
      >
        <SidebarContent onClose={onClose} user={user} />
      </motion.aside>
    </>
  )}
</AnimatePresence>
  );
}

function SidebarContent({ 
  onClose, 
  user 
}: { 
  onClose: () => void; 
  user?: User;
}) {
  return (
    <div className="h-full w-full flex flex-col">
      {/* Header / Profile */}
      <div className="shrink-0">
        <div className="relative h-40 rounded-t-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500">
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2">
            <motion.img
              whileHover={{ scale: 1.08 }}
              src={user?.avatar || "/default-avatar.png"}
              className="h-24 w-24 rounded-full border-4 border-slate-900 object-cover"
              alt="User"
            />
          </div>

          {/* Close Button */}
        <div className="absolute right-4 top-4">
          <motion.button
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-black/30
              text-white
              backdrop-blur-md
              transition-all
              duration-300
              hover:bg-red-500
              hover:border-red-400
              hover:shadow-lg
              hover:shadow-red-500/30
            "
            aria-label="Close Sidebar"
          >
            <HiOutlineXMark className="text-2xl" />
          </motion.button>
        </div>
        </div>

        <div className="mt-16 mb-4 text-center px-6">
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-400">{user?.bio}</p>

          <div className="mt-4 flex justify-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                user?.isOnline
                  ? "bg-green-500/20 text-green-400"
                  : "bg-slate-500/20 text-slate-400"
              }`}
            >
              {user?.isOnline ? "Online" : "Offline"}
            </span>
{user?.username ? (
              <Link to={`/dashboard/profile/${user.username}`}>
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-sm text-violet-300">
                  View Profile
                </span>
              </Link>
            ) : (
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-sm text-violet-300">
                View Profile
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Quick actions */}
        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Quick Actions
            </h3>
            <button className="text-xs text-violet-400 hover:text-violet-300 transition">
              Manage
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
          {[
            {
              icon: FaRegBellSlash ,
              title: "Mute",
              color: "from-amber-500/20 to-orange-500/20",
              iconColor: "text-amber-400",
            },
            {
              icon: HiOutlineStar,
              title: "Starred",
              color: "from-yellow-500/20 to-amber-500/20",
              iconColor: "text-yellow-400",
            },
            {
              icon: HiOutlineUsers,
              title: "Groups",
              color: "from-emerald-500/20 to-green-500/20",
              iconColor: "text-emerald-400",
            },
            {
              icon: HiOutlineTrash,
              title: "Clear",
              color: "from-red-500/20 to-rose-500/20",
              iconColor: "text-red-400",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <motion.button
          key={item.title}
          whileHover={{ y: -6, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            group
            relative
            flex
            flex-col
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            p-3
            transition-all
            duration-300
            hover:border-violet-500/40
            hover:bg-white/[0.08]
          "
        >
          {/* Glow */}
          <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/15 blur-3xl" />
          </div>

          <div
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}
          >
            <Icon className={`text-lg ${item.iconColor}`} />
          </div>

          <span className="relative z-10 text-center text-xs font-medium text-slate-300 group-hover:text-white">
            {item.title}
          </span>
        </motion.button>
            );
          })}
        </div>
        </div>

        {/* Wallpaper option */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-semibold">
              <BsChatSquareHeartFill className="text-cyan-400" />
              Wallpaper
            </div>
            <button className="text-xs text-cyan-400 hover:text-cyan-300 transition">
              Change
            </button>
          </div>
        </div>

        {/* Shared Media */}
        <div className="mt-8">
          <SectionHeading icon={<HiOutlinePhoto />} title="Shared Media & Files" right={<button className="text-sm text-cyan-400">View all</button>} />
        </div>

        {/* Mutually required actions (stubs for UI) */}
        <div className="mt-6 mb-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Conversation Controls
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                title: "Block User",
                icon: HiOutlineNoSymbol,
                color: "from-orange-500/20 to-red-500/20",
                iconColor: "text-orange-400",
              },
              {
                title: "Report User",
                icon: HiOutlineExclamationTriangle,
                color: "from-yellow-500/20 to-orange-500/20",
                iconColor: "text-yellow-400",
              },
              {
                title: "Delete Chat",
                icon: HiOutlineTrash,
                color: "from-red-500/20 to-rose-500/20",
                iconColor: "text-red-400",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.title}
                  whileHover={{ y: -5, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="
                    group
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-4
                    transition-all
                    duration-300
                    hover:border-violet-500/40
                    hover:bg-white/[0.08]
                  "
                >
                  <div
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}
                  >
                    <Icon
                      className={`text-xl ${item.iconColor} transition-transform duration-300 group-hover:scale-110`}
                    />
                  </div>

                  <p className="mt-3 text-center text-xs font-medium text-slate-300 group-hover:text-white">
                    {item.title}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

