import { motion } from "framer-motion";
import {
  HiOutlineHeart,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserPlus,
  HiOutlineAtSymbol,
  HiOutlineBell,
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineEllipsisHorizontal,
  HiOutlineCheck,
  HiOutlineTrash,
} from "react-icons/hi2";

type NotificationType =
  | "like"
  | "comment"
  | "request"
  | "mention"
  | "system"
  | "call"
  | "video";

interface NotificationCardProps {
  avatar: string;
  name: string;
  username: string;
  message: string;
  time: string;
  unread: boolean;
  type: NotificationType;
}

export default function NotificationCard({
  avatar,
  name,
  username,
  message,
  time,
  unread,
  type,
}: NotificationCardProps) {

  const notification = {
    like: {
      icon: HiOutlineHeart,
      color: "text-pink-400",
      bg: "from-pink-500/20 to-rose-500/20",
    },
    comment: {
      icon: HiOutlineChatBubbleLeftRight,
      color: "text-cyan-400",
      bg: "from-cyan-500/20 to-blue-500/20",
    },
    request: {
      icon: HiOutlineUserPlus,
      color: "text-emerald-400",
      bg: "from-emerald-500/20 to-green-500/20",
    },
    mention: {
      icon: HiOutlineAtSymbol,
      color: "text-violet-400",
      bg: "from-violet-500/20 to-fuchsia-500/20",
    },
    system: {
      icon: HiOutlineBell,
      color: "text-amber-400",
      bg: "from-amber-500/20 to-orange-500/20",
    },
    call: {
      icon: HiOutlinePhone,
      color: "text-green-400",
      bg: "from-green-500/20 to-emerald-500/20",
    },
    video: {
      icon: HiOutlineVideoCamera,
      color: "text-sky-400",
      bg: "from-sky-500/20 to-cyan-500/20",
    },
  }[type];

  const Icon = notification.icon;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-5
        backdrop-blur-xl
        transition-all
        duration-300
        hover:border-violet-500/40
        hover:bg-white/[0.06]
      "
    >
      {/* Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl opacity-0 transition group-hover:opacity-100" />

      <div className="relative z-10 flex items-start justify-between">

        {/* Left */}
        <div className="flex items-start gap-4">

          <div className="relative">

            <img
              src={avatar}
              alt={name}
              className="h-14 w-14 rounded-full object-cover"
            />

            {unread && (
              <span className="absolute -right-1 top-0 h-3.5 w-3.5 rounded-full bg-cyan-400 border-2 border-slate-900" />
            )}

          </div>

          <div>

            <div className="flex items-center gap-3">

              <h3 className="font-semibold text-white">
                {name}
              </h3>

              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${notification.bg}`}
              >
                <Icon className={`text-base ${notification.color}`} />
              </div>

            </div>

            <p className="mt-1 text-sm text-violet-300">
              @{username}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              {message}
            </p>

            <p className="mt-3 text-xs text-slate-500">
              {time}
            </p>

          </div>

        </div>

        {/* Menu */}
        <button className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition">
          <HiOutlineEllipsisHorizontal className="text-xl" />
        </button>

      </div>

      {/* Actions */}

      <div className="mt-6 flex flex-wrap gap-3">

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-violet-600
            to-cyan-500
            px-4
            py-2.5
            text-sm
            text-white
          "
        >
          <HiOutlineCheck />
          Mark Read
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-4
            py-2.5
            text-sm
            text-slate-300
            transition
            hover:bg-red-500
            hover:text-white
          "
        >
          <HiOutlineTrash />
          Delete
        </motion.button>

      </div>

    </motion.div>
  );
}