import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineUserPlus } from "react-icons/hi2";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { getSuggestions } from "../../services/userService";
import { sendFriendRequest } from "../../services/friendService";
import { useSocketContext } from "../../context/SocketContext";
import type { User } from "../../types/user";

interface SuggestionsResponse {
  data?: User[] | null;
}

interface FriendAcceptedPayload {
  friend: { _id?: string };
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
};

export default function Suggestions() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const { socket } = useSocketContext();

  const fetchSuggestions = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = (await getSuggestions()) as User[] | null | undefined;
      // The backend already excludes self, friends and already-requested
      // users — but keep the filter as a belt & suspenders guard.
      setUsers(((data ?? []) as User[]).filter((u) => u.relationship !== "self"));
    } catch (err) {
      console.error("Failed to load suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  // 🔔 Real-time: when the other user accepts our request → remove the
  // suggestion (they are now a friend and belong in the Friends tab).
  useEffect(() => {
    if (!socket) return;

    const onAccepted = (data: FriendAcceptedPayload) => {
      setUsers((prev) => prev.filter((u) => u._id !== data.friend?._id));
    };

    socket.on("friendRequestAccepted", onAccepted);
    return () => {
      socket.off("friendRequestAccepted", onAccepted);
    };
  }, [socket]);

  const handleAddFriend = async (user: User) => {
    if (busyIds.has(user._id)) return;
    setBusyIds((prev) => new Set(prev).add(user._id));

    try {
      await sendFriendRequest(user._id);
      toast.success(`Friend request sent to ${user.name}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Could not send friend request. Please try again.")
      );
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(user._id);
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
          <div>
            <h2 className="text-lg font-bold text-white">
              People You May Know
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Expand your developer network
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard/connections")}
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
            View All
          </button>
        </div>
      </div>

      {/* Loading */}
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
              <div className="mt-4 h-10 animate-pulse rounded-xl bg-white/5" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && users.length === 0 && (
        <div className="px-6 py-12 text-center text-sm text-slate-400">
          No suggestions right now. Check back later!
        </div>
      )}

      {/* Users */}
      {!loading && users.length > 0 && (
        <div className="divide-y divide-white/10">
          {users.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.08,
              }}
              whileHover={{
                backgroundColor: "rgba(255,255,255,.03)",
              }}
              className="flex gap-4 p-5"
            >
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="
                    h-14
                    w-14
                    rounded-full
                    border-2
                    border-violet-500/20
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
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-white">
                    {user.name}
                  </h3>

                  {user.isVerified && (
                    <HiOutlineBadgeCheck className="text-cyan-400" />
                  )}
                </div>

                <p className="text-sm text-violet-300">
                  @{user.username}
                </p>

                {user.bio && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                    {user.bio}
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={busyIds.has(user._id)}
                  onClick={() => handleAddFriend(user)}
                  className="
                    mt-4
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-600
                    to-cyan-500
                    py-2.5
                    font-medium
                    text-white
                    disabled:opacity-60
                  "
                >
                  <HiOutlineUserPlus />
                  {busyIds.has(user._id) ? "Sending..." : "Add Friend"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

