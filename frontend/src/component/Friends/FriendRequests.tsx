import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  HiOutlineUserPlus,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineInbox,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../../services/friendService";
import { useSocketContext } from "../../context/SocketContext";
import type { User } from "../../types/user";
import type { FriendRequestUser } from "../../socket/socketTypes";

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
};

/** Normalise a socket payload user into the app's User shape. */
const toUser = (u: FriendRequestUser): User => ({
  _id: u._id,
  name: u.name,
  username: u.username,
  avatar: u.avatar,
  bio: u.bio,
  isOnline: u.isOnline ?? false,
  lastSeen: u.lastSeen,
});

export default function FriendRequests() {
  const [requests, setRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const { socket } = useSocketContext();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getFriendRequests();
      setRequests(data);
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not load friend requests. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // 🔔 Real-time: when someone sends us a request while we're online, the
  // server emits `friendRequestReceived` — prepend it to the list instantly.
  useEffect(() => {
    if (!socket) return;

    const onFriendRequestReceived = (data: {
      request: FriendRequestUser;
      count: number;
    }) => {
      setRequests((prev) => {
        if (prev.some((r) => r._id === data.request._id)) return prev;
        return [toUser(data.request), ...prev];
      });
    };

    const onFriendRequestAccepted = (data: { friend: FriendRequestUser }) => {
      // The other person accepted OUR request — remove from our sent list if
      // it's shown here (no-op if we don't render sent requests).
      setRequests((prev) => prev.filter((r) => r._id !== data.friend._id));
    };

    const onFriendRequestRejected = (data: { userId: string }) => {
      setRequests((prev) => prev.filter((r) => r._id !== data.userId));
    };

    socket.on("friendRequestReceived", onFriendRequestReceived);
    socket.on("friendRequestAccepted", onFriendRequestAccepted);
    socket.on("friendRequestRejected", onFriendRequestRejected);

    return () => {
      socket.off("friendRequestReceived", onFriendRequestReceived);
      socket.off("friendRequestAccepted", onFriendRequestAccepted);
      socket.off("friendRequestRejected", onFriendRequestRejected);
    };
  }, [socket]);

  /** Optimistically remove a request card and update the pending count. */
  const handleAccept = async (userId: string) => {
    if (busyIds.has(userId)) return;

    const removed = requests.find((r) => r._id === userId);
    if (!removed) return;

    setBusyIds((prev) => new Set(prev).add(userId));
    setRequests((prev) => prev.filter((r) => r._id !== userId));

    try {
      await acceptFriendRequest(userId);
      // TODO: optionally notify the friends list store so it updates live.
    } catch (err) {
      // Rollback: only re-insert the failed user instead of restoring a
      // stale snapshot (safe when multiple cards are handled concurrently).
      setRequests((prev) =>
        prev.some((r) => r._id === userId) ? prev : [removed, ...prev]
      );
      setError(
        getErrorMessage(err, "Could not accept friend request. Please try again.")
      );
      setTimeout(() => setError(""), 4000);
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleReject = async (userId: string) => {
    if (busyIds.has(userId)) return;

    const removed = requests.find((r) => r._id === userId);
    if (!removed) return;

    setBusyIds((prev) => new Set(prev).add(userId));
    setRequests((prev) => prev.filter((r) => r._id !== userId));

    try {
      await rejectFriendRequest(userId);
    } catch (err) {
      setRequests((prev) =>
        prev.some((r) => r._id === userId) ? prev : [removed, ...prev]
      );
      setError(
        getErrorMessage(err, "Could not decline friend request. Please try again.")
      );
      setTimeout(() => setError(""), 4000);
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-xl
      "
    >
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-cyan-500/20
                to-violet-500/20
              "
            >
              <HiOutlineUserPlus className="text-2xl text-cyan-400" />
            </div>

            <div>
              <h2 className="font-bold text-white">Friend Requests</h2>
              <p className="text-sm text-slate-400">
                {loading
                  ? "Loading..."
                  : `${requests.length} Pending`}
              </p>
            </div>
          </div>

          <button
            onClick={fetchRequests}
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-3
              py-2
              text-xs
              text-slate-300
              transition
              hover:bg-violet-600
              hover:text-white
            "
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="
            m-4
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-3
            text-sm
            text-red-300
          "
        >
          <HiOutlineExclamationTriangle className="shrink-0 text-lg" />
          <span className="min-w-0 flex-1">{error}</span>
          <button
            onClick={fetchRequests}
            className="
              shrink-0
              rounded-lg
              border
              border-red-500/20
              px-2.5
              py-1
              text-xs
              hover:bg-red-500/20
            "
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="divide-y divide-white/10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded-lg bg-white/10" />
                  <div className="h-3 w-1/4 animate-pulse rounded-lg bg-white/5" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="h-10 animate-pulse rounded-xl bg-white/5" />
                <div className="h-10 animate-pulse rounded-xl bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && requests.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center px-6 py-16 text-center"
        >
          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-white/5
            "
          >
            <HiOutlineInbox className="text-3xl text-slate-500" />
          </div>
          <h3 className="mt-5 font-semibold text-white">No pending requests</h3>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            When someone sends you a friend request, it will show up here.
          </p>
        </motion.div>
      )}

      {/* Requests */}
      {!loading && requests.length > 0 && (
        <div className="divide-y divide-white/10">
          <AnimatePresence initial={false}>
            {requests.map((user, index) => (
              <motion.div
                key={user._id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40, height: 0, marginTop: 0 }}
                transition={{
                  opacity: { duration: 0.25 },
                  x: { duration: 0.25 },
                  height: { duration: 0.25 },
                  delay: index * 0.08,
                }}
                whileHover={{ backgroundColor: "rgba(255,255,255,.03)" }}
                className="overflow-hidden p-5"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar + online indicator */}
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="
                        h-14
                        w-14
                        rounded-full
                        border-2
                        border-violet-500/20
                        object-cover
                      "
                    />
                    <span
                      className={`
                        absolute
                        bottom-0
                        right-0
                        h-4
                        w-4
                        rounded-full
                        border-2
                        border-[#0B1120]
                        ${
                          user.isOnline
                            ? "bg-emerald-400"
                            : "bg-slate-500"
                        }
                      `}
                      title={user.isOnline ? "Online" : "Offline"}
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">
                      {user.name}
                    </h3>
                    <p className="truncate text-sm text-violet-300">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="mt-1 line-clamp-1 text-sm text-slate-400">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={busyIds.has(user._id)}
                    onClick={() => handleAccept(user._id)}
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-emerald-500
                      py-2.5
                      font-medium
                      text-white
                      transition
                      hover:bg-emerald-600
                      disabled:opacity-60
                    "
                  >
                    <HiOutlineCheck />
                    Accept
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={busyIds.has(user._id)}
                    onClick={() => handleReject(user._id)}
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      py-2.5
                      text-white
                      transition
                      hover:bg-red-500
                      disabled:opacity-60
                    "
                  >
                    <HiOutlineXMark />
                    Decline
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}

