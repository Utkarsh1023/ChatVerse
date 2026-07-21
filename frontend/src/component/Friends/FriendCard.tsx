import { motion } from "framer-motion";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineMapPin,
  HiOutlineUserCircle,
} from "react-icons/hi2";

type FriendCardProps = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  mutual: number;
  online: boolean;
};

export default function FriendCard({
  name,
  username,
  avatar,
  bio,
  location,
  online,
}: FriendCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      transition={{ duration: 0.25 }}
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-6
        backdrop-blur-xl
        transition-all
        duration-300
        hover:border-violet-500/40
        hover:shadow-2xl
        hover:shadow-violet-500/10
      "
    >
      {/* Background Glow */}

      <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

      {/* Decorative Gradient */}

      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />

      <div className="relative z-10">

        {/* Avatar */}

        <div className="relative mx-auto w-fit">

          <img
            src={avatar}
            alt={name}
            className="
              h-24
              w-24
              rounded-full
              border-4
              border-violet-500/20
              object-cover
            "
          />

          <span
            className={`
              absolute
              bottom-1
              right-1
              h-5
              w-5
              rounded-full
              border-2
              border-[#0B1120]
              ${
                online
                  ? "bg-emerald-400"
                  : "bg-slate-500"
              }
            `}
          />

        </div>

        {/* Name */}

        <div className="mt-5 text-center">

          <h3 className="text-xl font-semibold text-white">
            {name}
          </h3>

          <p className="mt-1 text-sm text-violet-300">
            @{username}
          </p>

        </div>

        {/* Bio */}

        <p className="mt-4 line-clamp-2 text-center text-sm leading-6 text-slate-400">
          {bio}
        </p>

        {/* Location */}

        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-400">
          <HiOutlineMapPin />
          {location}
        </div>

        {/* Divider */}

        <div className="my-6 h-px bg-white/10" />

        {/* Actions */}

        <div className="grid grid-cols-2 gap-3">

          <motion.button
            whileTap={{ scale: .95 }}
            className="
              flex
              items-center
              gap-2
              justify-center
              rounded-xl
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              py-3
              text-white
            "
          >
            <HiOutlineChatBubbleLeftRight className="text-lg" />
            <span>Message</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: .95 }}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              py-3
              text-slate-300
              transition
              hover:bg-white/10
            "
          >
            <HiOutlineUserCircle className="text-lg" />
            <span>Profile</span>
          </motion.button>

        </div>

      </div>
    </motion.div>
  );
}