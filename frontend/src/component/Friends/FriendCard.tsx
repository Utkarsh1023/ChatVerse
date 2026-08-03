import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineMapPin,
  HiOutlineUserPlus,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineUser,
} from "react-icons/hi2";
import { User } from "../../types/user";
import { useSocketContext } from "../../context/SocketContext";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../../services/friendService";
import { createOrGetConversation } from "../../services/chatService";

interface FriendCardProps {
  user: User;
  username: string; // The username of the user to view their profile
  /** Called when the logged-in user is found in results — lets the parent
   *  remove/hide the card instead of rendering it. */
  onSelfFound?: (user: User) => void;
}

/** Extract a human-readable message from an axios error response. */
const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
};

/**
 * Derive the initial button state from the backend's canonical
 * `relationship` field, falling back to the legacy boolean flags so
 * consumers using older endpoints still behave correctly.
 */
const initialRelationship = (user: User): User["relationship"] => {
  if (user.relationship) return user.relationship;
  if (user.isFriend) return "friend";
  if (user.requestSent) return "request_sent";
  if (user.incomingRequest) return "request_received";
  return "none";
};

/**
 * Relationship-driven action card (like Instagram / Discord / Telegram).
 *
 *   relationship === "self"              → card is hidden entirely
 *   relationship === "none"              → "Add Friend"
 *   relationship === "request_sent"      → "Request Sent" (disabled)
 *   relationship === "request_received"  → "Accept Request" + "Decline"
 *   relationship === "friend"            → "Message"
 *
 * All buttons are disabled while an API request is in flight, and the UI
 * updates optimistically after a successful send / accept.
 */
export default function FriendCard({ user,username, onSelfFound }: FriendCardProps) {
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState<User["relationship"]>(() =>
    initialRelationship(user)
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { socket } = useSocketContext();

  // If the backend ever returns our own profile (shouldn't happen — the API
  // excludes it), hide the card entirely as a defensive client-side filter.
  useEffect(() => {
    if (relationship === "self") {
      onSelfFound?.(user);
    }
  }, [relationship, user, onSelfFound]);

  // 🔔 Real-time: when the other user accepts our request → "friend".
  // When they reject it → back to "none" ("Add Friend").
  useEffect(() => {
    if (!socket) return;

    const onAccepted = (data: { friend: { _id?: string } }) => {
      if (data.friend?._id === user._id) {
        setRelationship("friend");
        toast.success(`${user.name} accepted your friend request 🎉`);
      }
    };

    const onRejected = (data: { userId: string }) => {
      if (data.userId === user._id) {
        setRelationship("none");
        toast.info(`${user.name} declined your friend request`);
      }
    };

    socket.on("friendRequestAccepted", onAccepted);
    socket.on("friendRequestRejected", onRejected);

    return () => {
      socket.off("friendRequestAccepted", onAccepted);
      socket.off("friendRequestRejected", onRejected);
    };
  }, [socket, user._id, user.name]);

  const handleAddFriend = useCallback(async () => {
    if (busy) return; // prevent duplicate clicks while in-flight
    setBusy(true);
    setError("");

    // Optimistic update: show "Request Sent" immediately.
    setRelationship("request_sent");

    try {
      await sendFriendRequest(user._id);
      toast.success(`Friend request sent to ${user.name}`);
    } catch (err) {
      // Map known business-rule rejections to the correct visual state:
      //   - already friends → "friend"
      //   - request already sent → "request_sent"
      //   - mutual request (they sent us one) → backend auto-accepts → "friend"
      let next: User["relationship"] = "none";
      let message = "";

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const apiMessage = err.response?.data?.message;

        if (status === 400 && /already friends/i.test(apiMessage || "")) {
          next = "friend";
        } else if (
          status === 409 ||
          /already sent/i.test(apiMessage || "") ||
          status === 200 ||
          status === 201
        ) {
          next = "request_sent";
        } else {
          message =
            apiMessage || "Could not send friend request. Please try again.";
        }
      }

      // Revert the optimistic "request_sent" to the correct state.
      setRelationship(next === "none" ? "none" : next);

      if (message) {
        setError(message);
        toast.error(getErrorMessage(err, "Could not send friend request."));
      }

      console.error("Add friend error:", err);
    } finally {
      setBusy(false);
    }
  }, [busy, user._id, user.name]);

  const handleAccept = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError("");

    // Optimistic update: they become a friend immediately.
    setRelationship("friend");

    try {
      await acceptFriendRequest(user._id);
      toast.success(`You and ${user.name} are now friends 🎉`);
    } catch (err) {
      setRelationship("request_received");
      setError(
        getErrorMessage(err, "Could not accept friend request. Please try again.")
      );
      toast.error(getErrorMessage(err, "Could not accept friend request."));
      console.error("Accept friend error:", err);
    } finally {
      setBusy(false);
    }
  }, [busy, user._id, user.name]);

  const handleDecline = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError("");

    // Optimistic update: request gone → "none".
    setRelationship("none");

    try {
      await rejectFriendRequest(user._id);
      toast.info(`Friend request from ${user.name} declined`);
    } catch (err) {
      setRelationship("request_received");
      setError(
        getErrorMessage(err, "Could not decline friend request. Please try again.")
      );
      toast.error(getErrorMessage(err, "Could not decline friend request."));
      console.error("Decline friend error:", err);
    } finally {
      setBusy(false);
    }
  }, [busy, user._id, user.name]);

  const handleMessage = useCallback(async () => {
    try {
      setBusy(true);
      // Create-or-fetch the conversation so it appears in the chat list.
      await createOrGetConversation(user._id);
      navigate("/dashboard/chats");
    } catch (err) {
      console.error("Failed to open conversation:", err);
      toast.error("Could not open conversation. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [user._id, navigate]);

  // 🐞 TRACE: confirm the username used when navigating to the profile page.
  // The "View Profile" button links to /dashboard/profile/${username}.
  // If this logs `undefined`, the parent component is not passing `username`.
  console.log(
    `[FriendCard] View Profile -> /dashboard/profile/${username} (user._id=${user._id}, user.username=${user.username})`
  );

  // Hide self entirely.
  if (relationship === "self") return null;

  // Determine which buttons to render based on the relationship.
  const isAdd = relationship === "none";
  const isSent = relationship === "request_sent";
  const isIncoming = relationship === "request_received";
  const isFriend = relationship === "friend";

  const primaryLabel = isSent
    ? "Request Sent"
    : isIncoming
      ? "Accept Request"
      : isFriend
        ? "Message"
        : "Add Friend";

  const primaryIcon = isIncoming ? (
    <HiOutlineCheck className="text-lg" />
  ) : isFriend ? (
    <HiOutlineChatBubbleLeftRight className="text-lg" />
  ) : (
    <HiOutlineUserPlus className="text-lg" />
  );

  const handlePrimary = isAdd
    ? handleAddFriend
    : isIncoming
      ? handleAccept
      : isFriend
        ? handleMessage
        : undefined;

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
      
      <div className="relative z-10">
        {/* Avatar */}
        <div className="relative mx-auto w-fit">
          <img
            src={user.avatar}
            alt={user.name}
            className="
        relative
        w-28
        h-28
        rounded-full
        object-cover
        border-[5px]
        border-white/20
        shadow-2xl
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
                user.isOnline
                  ? "bg-emerald-400"
                  : "bg-slate-500"
              }
            `}
          />
        </div>

        {/* Name */}
        <div className="mt-5 text-center">
          <h3 className="text-xl font-semibold text-white">
            {user.name}
          </h3>

          <p className="mt-1 text-sm text-violet-300">
            @{user.username}
          </p>
        </div>

        {/* Bio */}
        <p className="mt-4 line-clamp-2 text-center text-sm leading-6 text-slate-400">
          {user.bio}
        </p>

        {/* Location
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-400">
          <HiOutlineMapPin />
          {user.location}
        </div> */}

        {/* Divider */}
        <div className="my-5 h-px bg-white/10" />

        {/* Actions */}
<div className=" grid grid-cols-2 gap-3">

  {/* Primary Button */}
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={handlePrimary}
    disabled={busy || isSent || !handlePrimary}
    className={`
      relative
      overflow-hidden
      w-full
      h-11
      rounded-2xl
      flex
      items-center
      justify-center
      gap-2
      font-semibold
      text-[15px]
      text-white
      transition-all
      duration-300
      disabled:opacity-50
      disabled:cursor-not-allowed
      ${
        isFriend
          ? "bg-gradient-to-r from-sky-500 to-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30"
          : isIncoming
          ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-lg hover:shadow-emerald-500/30"
          : isSent
          ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
          : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:shadow-lg hover:shadow-violet-500/30"
      }
    `}
  >
    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition" />

    <span className="relative flex items-center gap-2">
      {primaryIcon}

      {busy
        ? isFriend
          ? "Opening..."
          : isIncoming
          ? "Accepting..."
          : "Sending..."
        : primaryLabel}
    </span>
  </motion.button>

          {/* Secondary action:
              - incoming request → "Decline"
              - everything else → "View Profile" */}
          {isIncoming ? (
            <motion.button
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  onClick={handleDecline}
  disabled={busy}
  className="
    flex items-center justify-center gap-2
    rounded-2xl
    h-12
    border border-red-500/20
    bg-red-500/10
    text-red-300
    font-semibold
    transition-all
    duration-300
    hover:bg-red-500
    hover:text-white
    hover:shadow-lg
    hover:shadow-red-500/30
    disabled:opacity-50
  "
>
  <HiOutlineXMark className="text-lg" />
  <span>Decline</span>
</motion.button>
          ) : (
            <Link to={`/dashboard/profile/${username}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="
          w-full
          h-11
          rounded-2xl
          border
          border-white/10
          bg-white/5
          hover:bg-white/10
          hover:border-violet-500/40
          text-slate-200
          flex
          items-center
          justify-center
          gap-2
          transition-all
        "
      >
        <HiOutlineUser />
        Profile
      </motion.button>
    </Link>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}

