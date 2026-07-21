import { motion } from "framer-motion";
import {
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineChatBubbleLeftRight,
  HiOutlineEllipsisHorizontal,
  HiOutlinePhoneArrowDownLeft,
  HiOutlinePhoneArrowUpRight,
  HiOutlineClock,
} from "react-icons/hi2";
import { HiOutlinePhoneMissedCall } from "react-icons/hi";

type CallType = "incoming" | "outgoing" | "missed";
type MediaType = "voice" | "video";

interface CallCardProps {
  name: string;
  username: string;
  avatar: string;
  type: CallType;
  media: MediaType;
  duration: string;
  time: string;
  online: boolean;
}

export default function CallCard({
  name,
  username,
  avatar,
  type,
  media,
  duration,
  time,
  online,
}: CallCardProps) {
  const status =
    type === "incoming"
      ? {
          icon: HiOutlinePhoneArrowDownLeft,
          color: "text-emerald-400",
          label: "Incoming",
        }
      : type === "outgoing"
      ? {
          icon: HiOutlinePhoneArrowUpRight,
          color: "text-violet-400",
          label: "Outgoing",
        }
      : {
          icon: HiOutlinePhoneMissedCall,
          color: "text-red-400",
          label: "Missed",
        };

  const StatusIcon = status.icon;

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
        bg-slate-900/60
        p-6
        backdrop-blur-xl
        transition-all
        duration-300
        hover:border-violet-500/40
        hover:shadow-xl
        hover:shadow-violet-500/10
      "
    >
      {/* Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl opacity-0 transition duration-300 group-hover:opacity-100" />

      {/* Top */}
      <div className="flex items-start justify-between">

        <div className="flex items-center gap-4">

          <div className="relative">

            <img
              src={avatar}
              alt={name}
              className="h-16 w-16 rounded-full object-cover"
            />

            {online && (
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-slate-900 bg-green-500" />
            )}

          </div>

          <div>

            <h3 className="text-lg font-semibold text-white">
              {name}
            </h3>

            <p className="text-sm text-slate-400">
              @{username}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">

              <span className={`flex items-center gap-1 ${status.color}`}>
                <StatusIcon className="text-lg" />
                {status.label}
              </span>

              <span className="text-slate-500">•</span>

              <span className="flex items-center gap-1 text-slate-400">
                {media === "video" ? (
                  <HiOutlineVideoCamera />
                ) : (
                  <HiOutlinePhone />
                )}

                {media === "video"
                  ? "Video Call"
                  : "Voice Call"}
              </span>

            </div>

          </div>

        </div>

        <button
          className="
            rounded-xl
            p-2
            text-slate-400
            transition
            hover:bg-white/10
            hover:text-white
          "
        >
          <HiOutlineEllipsisHorizontal className="text-xl" />
        </button>

      </div>

      {/* Bottom */}

      <div className="mt-6 flex items-center justify-between">

        <div className="flex items-center gap-6">

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <HiOutlineClock />
            {duration}
          </div>

          <span className="text-sm text-slate-500">
            {time}
          </span>

        </div>

        <div className="flex gap-3">

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-emerald-500/20
              text-emerald-400
              transition
              hover:bg-emerald-500
              hover:text-white
            "
          >
            <HiOutlinePhone />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-cyan-500/20
              text-cyan-400
              transition
              hover:bg-cyan-500
              hover:text-white
            "
          >
            <HiOutlineVideoCamera />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-violet-500/20
              text-violet-400
              transition
              hover:bg-violet-500
              hover:text-white
            "
          >
            <HiOutlineChatBubbleLeftRight />
          </motion.button>

        </div>

      </div>

    </motion.div>
  );
}