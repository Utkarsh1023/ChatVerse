import {
  HiHeart,
  HiChatBubbleOvalLeft,
  HiUserPlus,
  HiAtSymbol,
  HiVideoCamera,
  HiShieldCheck,
} from "react-icons/hi2";
import { HiPhoneMissedCall } from "react-icons/hi";
interface NotificationItemProps {
  avatar: string;
  name: string;
  username: string;
  time: string;
  unread: boolean;
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
}
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
export default function NotificationItem({
  avatar,
  name,
  time,
  unread,
  type,
  postImage,
  comment,
}: NotificationItemProps) {
  const icon = () => {
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
          {icon()}
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
            {time}
          </span>

          {unread && (
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
          )}
        </div>
      </div>

      {/* Right Side */}

      <div className="flex items-center gap-2">
        {type === "friend_request" ? (
          <>
            <button className="rounded-full bg-sky-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-sky-600">
              Accept
            </button>

            <button className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/20">
              Decline
            </button>
          </>
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
      </div>
    </div>
  );
}