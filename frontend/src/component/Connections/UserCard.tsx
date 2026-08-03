import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineUser,
  HiOutlineUserMinus,
  HiOutlineUserPlus,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineHeart,
} from "react-icons/hi2";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { createOrGetConversation } from "../../services/chatService";
import { toast } from "react-toastify";

export type UserCardVariant =
  | "friend"
  | "follower"
  | "following"
  | "request"
  | "suggestion";

interface UserCardProps {
  variant: UserCardVariant;
  id: string;
  name: string;
  username: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  profession?: string;
  isOnline?: boolean;
  isVerified?: boolean;
  mutualFriends?: number;
  followers?: number;
  /** Date metadata (followedAt / followingSince / receivedAt). */
  dateLabel?: string;
  /** Suggestion: already following? */
  isFollowing?: boolean;
  /** Follower: already follow back? */
  isFollowingBack?: boolean;
  /** Following: already friends? */
  isFriend?: boolean;
  busy?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onRemoveFriend?: () => void;
  onRemoveFollower?: () => void;
  onUnfollow?: () => void;
  onFollowBack?: () => void;
  onAddFriend?: () => void;
  onFollow?: () => void;
}

const formatDate = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/** "Time since" for friend requests (e.g. "2h ago"). */
const timeAgo = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
};

export default function UserCard({
  variant,
  id,
  name,
  username,
  avatar,
  coverImage,
  bio,
  profession,
  isOnline,
  isVerified,
  mutualFriends,
  followers,
  dateLabel,
  isFollowing,
  isFollowingBack,
  isFriend,
  busy,
  onAccept,
  onDecline,
  onRemoveFriend,
  onRemoveFollower,
  onUnfollow,
  onFollowBack,
  onAddFriend,
  onFollow,
}: UserCardProps) {
  const navigate = useNavigate();

  const handleMessage = async () => {
    try {
      await createOrGetConversation(id);
      navigate("/dashboard/chats");
    } catch (err) {
      console.error("Failed to open conversation:", err);
      toast.error("Could not open conversation. Please try again.");
    }
  };

  const profilePath = `/dashboard/profile/${username}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl transition-all duration-300 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10"
    >
      {/* Gradient-style accent on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/0 via-transparent to-cyan-500/0 opacity-0 transition-opacity duration-300 group-hover:from-violet-500/10 group-hover:to-cyan-500/10 group-hover:opacity-100" />

      {/* Cover image */}
      {coverImage && (
        <div className="relative h-24 w-full overflow-hidden">
          <img
            src={coverImage}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent" />
        </div>
      )}

      {/* Avatar */}
      <div className={`relative z-10 mx-auto -mt-8 w-fit ${coverImage ? "" : "mt-6"}`}>
        <div className="relative">
          <img
            src={avatar || "https://ui-avatars.com/api/?background=random"}
            alt={name}
            className="h-32 w-32 rounded-full border-4 border-[#0B1120] object-cover shadow-lg"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-[#0B1120] bg-emerald-400" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="truncate font-semibold text-white">{name}</h3>
          {isVerified && <HiOutlineBadgeCheck className="shrink-0 text-cyan-400" />}
          <p className="truncate text-sm text-violet-300">  {username}</p>
        </div>
        

        {profession && (
          <p className="mt-1 text-xs text-slate-400">{profession}</p>
        )}

        {bio && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
            {bio}
          </p>
        )}

        {/* Meta badges */}
        {(mutualFriends !== undefined || followers !== undefined || dateLabel) && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            {mutualFriends !== undefined && mutualFriends > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-1 text-violet-300">
                <HiOutlineUsers /> {mutualFriends} mutual
              </span>
            )}
            {followers !== undefined && (
              <span className="flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-1 text-sky-300">
                <HiOutlineHeart /> {followers}
              </span>
            )}
            {dateLabel && (
              <span className="rounded-full bg-white/5 px-2.5 py-1">
                {dateLabel}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {variant === "friend" && (
            <>
              <button
                onClick={handleMessage}
                disabled={busy}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-sm font-medium text-white transition hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-60"
              >
                <HiOutlineChatBubbleLeftRight /> Message
              </button>
              <Link to={profilePath}>
                <button className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 transition hover:bg-white/10">
                  <HiOutlineUser /> Profile
                </button>
              </Link>
              <button
                onClick={onRemoveFriend}
                disabled={busy}
                className="col-span-2 flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-300 transition hover:bg-red-500 hover:text-white disabled:opacity-60"
              >
                <HiOutlineUserMinus /> Remove Friend
              </button>
            </>
          )}

          {variant === "follower" && (
            <>
              <Link to={profilePath}>
                <button className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 transition hover:bg-white/10">
                  <HiOutlineUser /> Profile
                </button>
              </Link>
              {!isFollowingBack && (
                <button
                  onClick={onFollowBack}
                  disabled={busy}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-sm font-medium text-white transition hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-60"
                >
                  <HiOutlineUserPlus /> Follow Back
                </button>
              )}
              <button
                onClick={onRemoveFollower}
                disabled={busy}
                className="col-span-2 flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-300 transition hover:bg-red-500 hover:text-white disabled:opacity-60"
              >
                <HiOutlineTrash /> Delete
              </button>
            </>
          )}

          {variant === "following" && (
            <>
              <Link to={profilePath}>
                <button className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 transition hover:bg-white/10">
                  <HiOutlineUser /> Profile
                </button>
              </Link>
              {isFriend ? (
                <button
                  onClick={handleMessage}
                  disabled={busy}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-sm font-medium text-white transition hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-60"
                >
                  <HiOutlineChatBubbleLeftRight /> Message
                </button>
              ) : (
                <button
                  disabled
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-400"
                >
                  <HiOutlineChatBubbleLeftRight /> Message
                </button>
              )}
              <button
                onClick={onUnfollow}
                disabled={busy}
                className="col-span-2 flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
              >
                <HiOutlineUserMinus /> Unfollow
              </button>
            </>
          )}

          {variant === "request" && (
            <>
              <Link to={profilePath}>
                <button className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 transition hover:bg-white/10">
                  <HiOutlineUser /> Profile
                </button>
              </Link>
              <button
                disabled
                className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs text-slate-400"
              >
                {timeAgo(dateLabel)}
              </button>
              <button
                onClick={onAccept}
                disabled={busy}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-60"
              >
                <HiOutlineCheck /> Accept
              </button>
              <button
                onClick={onDecline}
                disabled={busy}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                <HiOutlineXMark /> Decline
              </button>
            </>
          )}

          {variant === "suggestion" && (
            <>
              <Link to={profilePath}>
                <button className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 transition hover:bg-white/10">
                  <HiOutlineUser /> Profile
                </button>
              </Link>
              <button
                onClick={onAddFriend}
                disabled={busy}
                className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-sm font-medium text-white transition hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-60"
              >
                <HiOutlineUserPlus /> Add Friend
              </button>
              <button
                onClick={onFollow}
                disabled={busy || isFollowing}
                className="col-span-2 flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
