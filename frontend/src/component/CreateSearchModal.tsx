import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineUserPlus,
  HiOutlineCheck,
  HiOutlineChatBubbleLeftRight,
  HiUserCircle,
} from "react-icons/hi2";
import { searchUsers } from "../services/userService";
import {
  sendFriendRequest,
  acceptFriendRequest,
} from "../services/friendService";
import { createOrGetConversation } from "../services/chatService";
import { User } from "../types/user";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({
  open,
  onClose,
}: SearchModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Reset state when the modal closes so it never shows stale results.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
      setBusyId(null);
    }
  }, [open]);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClick);
    }

    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  // Search (debounced)
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);

        const users = await searchUsers(query);

        setResults(users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleAddFriend = async (user: User) => {
    try {
      setBusyId(user._id);
      await sendFriendRequest(user._id);
      toast.success(`Friend request sent to ${user.name}`);
      setResults((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, relationship: "request_sent" } : u
        )
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Could not send friend request."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleAccept = async (user: User) => {
    try {
      setBusyId(user._id);
      await acceptFriendRequest(user._id);
      toast.success(`You are now friends with ${user.name}`);
      setResults((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, relationship: "friend" } : u
        )
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Could not accept request."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleMessage = async (user: User) => {
    try {
      setBusyId(user._id);
      await createOrGetConversation(user._id);
      onClose();
      navigate("/dashboard/chats");
    } catch (err) {
      console.error(err);
      toast.error("Could not open conversation. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleViewProfile = (user: User) => {
    onClose();
    navigate(`/dashboard/profile/${user.username}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            initial={{
            x:-450,
            opacity:0
            }}

            animate={{
            x:0,
            opacity:1
            }}

            exit={{
            x:-450,
            opacity:0
            }}
            transition={{
              duration: 0.25,
            }}
            className="
            mt-10
            mb-10
            w-full
            rounded-2xl
            bg-slate-900/95
            p-0
            max-w-lg
            overflow-hidden
            border-r
            border-white/10
            bg-slate-900/95
            backdrop-blur-3xl
            shadow-[0_0_80px_rgba(0,0,0,0.45)]
            "
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <h2 className="text-xl font-bold text-white">
                Search Users
              </h2>

              <button
                onClick={onClose}
                className="rounded-xl p-2 hover:bg-white/10"
              >
                <HiOutlineXMark
                  className="text-white"
                  size={24}
                />
              </button>
            </div>

            {/* Search */}

            <div className="p-5">
              <div className="relative">

                <HiOutlineMagnifyingGlass
                className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400"
                />

                <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or username..."
                className="
                w-full
                rounded-2xl
                bg-slate-800/70
                border
                border-white/10
                py-4
                pl-12
                pr-12
                text-white
                placeholder:text-slate-500
                focus:border-violet-500
                focus:ring-4
                focus:ring-violet-500/20
                "
                />

                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                  >
                    <HiOutlineXMark size={18} />
                  </button>
                )}

                </div>
            </div>

            {/* Body */}

            <div className="max-h-[500px] overflow-y-auto px-5 pb-5">
              {loading && (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-2xl bg-slate-800"
                    />
                  ))}
                </div>
              )}

              {!loading &&
                query &&
                results.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-slate-400">
                      No users found.
                    </p>
                  </div>
                )}

              {!loading &&
                results.map((user) => (
                  <motion.div
                    key={user._id}
                    whileHover={{
                      scale: 1.01,
                    }}
                    className="
                      mb-3
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.03]
                      p-4
                    "
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar || "https://ui-avatars.com/api/?background=random"}
                        alt={user.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />

                      <div>
                        <h3 className="font-semibold text-white">
                          {user.name}
                        </h3>

                        <p className="text-sm text-slate-400">
                          @{user.username}
                        </p>

                        {user.bio && (
                          <p className="mt-1 text-xs text-slate-500">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {user.relationship === "friend" ? (
                        <button
                          onClick={() => handleMessage(user)}
                          disabled={busyId === user._id}
                          className="
                            rounded-xl
                            bg-cyan-600
                            p-3
                            text-white
                            hover:bg-cyan-500
                            disabled:opacity-60
                          "
                        >
                          <HiOutlineChatBubbleLeftRight size={18} />
                        </button>
                      ) : user.relationship === "request_sent" ? (
                        <button
                          disabled
                          className="
                            rounded-xl
                            bg-white/10
                            p-3
                            text-slate-400
                            cursor-not-allowed
                          "
                        >
                          <HiOutlineCheck size={18} />
                        </button>
                      ) : user.relationship === "request_received" ? (
                        <button
                          onClick={() => handleAccept(user)}
                          disabled={busyId === user._id}
                          className="
                            rounded-xl
                            bg-emerald-600
                            p-3
                            text-white
                            hover:bg-emerald-500
                            disabled:opacity-60
                          "
                        >
                          <HiOutlineCheck size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddFriend(user)}
                          disabled={busyId === user._id}
                          className="
                            rounded-xl
                            bg-violet-600
                            p-3
                            text-white
                            hover:bg-violet-500
                            disabled:opacity-60
                          "
                        >
                          <HiOutlineUserPlus size={18} />
                        </button>
                      )}

<button
                        onClick={() => handleViewProfile(user)}
                        disabled={busyId === user._id}
                        className="
                          rounded-xl
                          bg-cyan-600
                          p-3
                          text-white
                          hover:bg-cyan-500
                          disabled:opacity-60
                        "
                      >
                        <HiUserCircle 
                          size={18}
                        />
                      </button>
                    </div>
                  </motion.div>
                ))}

              {!query && (
                <div className="py-16 text-center text-slate-500">
                  Start typing to search for developers, friends, or users.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
