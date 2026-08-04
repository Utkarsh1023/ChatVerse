import { useState } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiHeart,
  HiChatBubbleOvalLeft,
  HiUserPlus,
  HiAtSymbol,
  HiVideoCamera,
  HiShieldCheck,
  HiCheckCircle,
  HiOutlineCheck,
  HiOutlineXMark,
} from "react-icons/hi2";
import { HiPhoneMissedCall } from "react-icons/hi";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "../../services/friendService";

type NotificationStatus = "pending" | "accepted" | "declined";

interface NotificationItemProps {
  avatar: string;
  name: string;
  username: string;
  time: string;
  unread: boolean;
  status?: NotificationStatus;
  type:
    | "friend_request"
    | "friend_accept"
    | "follow"
    | "like_post"
    | "comment_post"
    | "reply_comment"
    | "story_like"
    | "story_reply"
    | "message"
    | "message_reaction"
    | "voice_call"
    | "video_call"
    | "missed_call"
    | "mention"
    | "system";

  postImage?: string;
  comment?: string;
  senderId?: string;
  notificationId?: string;
  onRequestAction?: (
    notificationId: string,
    senderId: string,
    outcome: "accepted" | "declined"
  ) => void;
}
/** Format an ISO timestamp into a friendly "time ago" string (e.g. "2h ago"). */
const timeAgo = (iso: string): string => {
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
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getMessage = (type: NotificationItemProps["type"]) => {
  switch (type) {
    case "friend_request":
      return "sent you a friend request.";

    case "friend_accept":
      return "accepted your friend request.";

    case "follow":
      return "started following you.";

    case "like_post":
      return "liked your post.";

    case "comment_post":
      return "commented on your post.";

    case "reply_comment":
      return "replied to your comment.";

    case "story_like":
      return "liked your story.";

    case "story_reply":
      return "replied to your story.";

    case "message":
      return "sent you a message.";

    case "message_reaction":
      return "reacted to your message.";

    case "voice_call":
      return "started a voice call.";

    case "video_call":
      return "started a video call.";

    case "missed_call":
      return "missed your call.";

    case "mention":
      return "mentioned you.";

    case "system":
      return "sent you an update.";

    default:
      return "";
  }
};

const icon = (type: NotificationItemProps["type"]) => {
  switch (type) {
    case "like_post":
    case "story_like":
      return <HiHeart className="text-pink-500" size={18} />;

    case "comment_post":
    case "reply_comment":
    case "story_reply":
    case "message":
      return (
        <HiChatBubbleOvalLeft
          className="text-sky-400"
          size={18}
        />
      );

    case "friend_request":
      return (
        <HiUserPlus
          className="text-emerald-400"
          size={18}
        />
      );

    case "friend_accept":
      return (
        <HiUserPlus
          className="text-green-500"
          size={18}
        />
      );

    case "follow":
      return (
        <HiUserPlus
          className="text-indigo-400"
          size={18}
        />
      );

    case "mention":
      return (
        <HiAtSymbol
          className="text-violet-400"
          size={18}
        />
      );

    case "video_call":
      return (
        <HiVideoCamera
          className="text-rose-400"
          size={18}
        />
      );

    case "voice_call":
    case "missed_call":
      return (
        <HiPhoneMissedCall
          className="text-yellow-400"
          size={18}
        />
      );

    case "message_reaction":
      return (
        <HiHeart
          className="text-red-400"
          size={18}
        />
      );

    default:
      return (
        <HiShieldCheck
          className="text-cyan-400"
          size={18}
        />
      );
  }
};

export default function NotificationItem({
  avatar,
  name,
  time,
  unread,
  type,
  status = "pending",
  postImage,
  comment,
  senderId,
  notificationId,
  onRequestAction,
}: NotificationItemProps) {
  const [actionLoading, setActionLoading] = useState<
    "accept" | "reject" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: "accept" | "reject") => {
    if (!senderId) return;
    setError(null);
    setActionLoading(action);

    try {
      if (action === "accept") {
        await acceptFriendRequest(senderId);
        toast.success(`You and ${name} are now friends 🎉`);
        if (notificationId && onRequestAction) {
          onRequestAction(notificationId, senderId, "accepted");
        }
      } else {
        await rejectFriendRequest(senderId);
        toast.info(`Friend request from ${name} declined`);
        if (notificationId && onRequestAction) {
          onRequestAction(notificationId, senderId, "declined");
        }
      }
    } catch (err: any) {
      console.error(
        `Failed to ${action} friend request:`,
        err
      );
      setError(
        err?.response?.data?.message ||
          `Failed to ${action} request. Please try again.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const isFriendRequest = type === "friend_request";

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 transition hover:bg-white/5 ${
        unread ? "bg-white/[0.02]" : ""
      }`}
    >
      {/* Avatar */}

      <div className="relative flex-shrink-0">
        <img
          src={avatar}
          alt={name}
          className="h-14 w-14 rounded-full object-cover"
        />

        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0f172a] bg-[#1e293b]">
          {icon(type)}
        </div>
      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 text-slate-300">
          <span className="font-semibold text-white">
            {name}
          </span>{" "}
          {getMessage(type)}
        </p>

        {comment && (
          <p className="mt-1 line-clamp-1 text-sm italic text-slate-500">
            "{comment}"
          </p>
        )}

        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {timeAgo(time)}
          </span>

          {unread && (
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Right Side */}

      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {isFriendRequest && status === "pending" ? (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <button
                disabled={actionLoading !== null}
                onClick={() => handleAction("accept")}
                className="flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === "accept" ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                ) : (
                  <HiOutlineCheck size={14} />
                )}
                {actionLoading === "accept" ? "Accepting..." : "Accept"}
              </button>

              <button
                disabled={actionLoading !== null}
                onClick={() => handleAction("reject")}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === "reject" ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                ) : (
                  <HiOutlineXMark size={14} />
                )}
                {actionLoading === "reject" ? "Declining..." : "Decline"}
              </button>
            </motion.div>
          ) : isFriendRequest && status === "accepted" ? (
            <motion.div
              key="accepted"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400"
            >
              <HiCheckCircle size={16} />
              You and {name} are now friends.
            </motion.div>
          ) : isFriendRequest && status === "declined" ? (
            <motion.div
              key="declined"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-1.5 rounded-full bg-slate-500/10 px-4 py-2 text-xs font-medium text-slate-400"
            >
              <HiOutlineXMark size={16} />
              You declined {name}'s friend request.
            </motion.div>
          ) : type === "follow" ? (
            <button className="rounded-full bg-sky-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-sky-600">
              Follow Back
            </button>
          ) : postImage ? (
            <img
              src={postImage}
              alt=""
              className="h-14 w-14 rounded-xl object-cover"
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
