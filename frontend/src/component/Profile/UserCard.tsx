import { motion } from "framer-motion";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineUser,
} from "react-icons/hi2";
import type { UserProfile } from "../../api/profile";

export interface UserCardProps {
  user: UserProfile;
  /** Show the "Message" action button. Defaults to true. */
  showMessageButton?: boolean;
  /** Show the "View Profile" action button. Defaults to true. */
  showProfileButton?: boolean;
  /** Called when the "Message" button is clicked. */
  onMessage?: (user: UserProfile) => void;
  /** Called when the "View Profile" button is clicked. */
  onProfile?: (user: UserProfile) => void;
}

/**
 * Reusable glassmorphism user card used across the Friends, Followers and
 * Following tabs. Displays the avatar, full name and @username, plus two
 * gradient action buttons (Message / View Profile).
 *
 * Fully responsive — the card and its buttons adapt to narrow screens.
 */
export default function UserCard({
  user,
  showMessageButton = true,
  showProfileButton = true,
  onMessage,
  onProfile,
}: UserCardProps) {
  const fullName = user.fullName || user.name || "Unknown User";
  const username = user.username || "";
  const avatar = user.avatar || "https://ui-avatars.com/api/?background=random";
  const hasActions = showMessageButton || showProfileButton;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F172A] p-6 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/15"
    >
      {/* Background Glow */}
      <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-violet-500/10 opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />
      <div className="absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-cyan-500/10 opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />

      <div className="relative z-10">
        {/* Avatar */}
        <div className="relative mx-auto w-fit">
          <div className="rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 p-[3px]">
            <img
              src={avatar}
              alt={fullName}
              className="h-24 w-24 rounded-full border-4 border-[#0B1120] object-cover"
            />
          </div>

          {user.isOnline && (
            <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-[#0B1120] bg-emerald-400" />
          )}
        </div>

        {/* Name */}
        <div className="mt-5 text-center">
          <h3 className="truncate text-xl font-semibold text-white">
            {fullName}
          </h3>
          {username && (
            <p className="mt-1 truncate text-sm text-violet-300">@{username}</p>
          )}
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-white/10" />

        {/* Actions */}
        {hasActions && (
          <div className="grid grid-cols-2 gap-3">
            {showMessageButton && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onMessage?.(user)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/30"
              >
                <HiOutlineChatBubbleLeftRight className="text-lg" />
                <span>Message</span>
              </motion.button>
            )}

            {showProfileButton && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onProfile?.(user)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 font-semibold text-slate-200 transition-all duration-300 hover:border-violet-500/40 hover:bg-white/10 hover:text-white"
              >
                <HiOutlineUser className="text-lg" />
                <span>Profile</span>
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
