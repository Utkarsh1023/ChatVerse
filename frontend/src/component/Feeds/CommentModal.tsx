import { AnimatePresence, motion } from "framer-motion";
import { HiOutlinePaperAirplane, HiXMark } from "react-icons/hi2";
import { useState } from "react";
import { CommentData, createComment } from "../../api/commentApi";

type CommentsModalProps = {
  postId: string;
  open: boolean;
  onClose: () => void;
  comments: CommentData[];
  onCommentAdded: (comment: CommentData) => void;
};

function formatTimeAgo(createdAt: string): string {
  const now = Date.now();
  const then = new Date(createdAt).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return new Date(createdAt).toLocaleDateString();
}

export default function CommentsModal({
  postId,
  open,
  onClose,
  comments,
  onCommentAdded,
}: CommentsModalProps) {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addComment = async () => {
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await createComment(postId, newComment.trim());
      onCommentAdded(res.data.comment);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addComment();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background */}
          <div
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="
              relative
              z-10
              w-full
              max-w-2xl
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-slate-900
              shadow-2xl
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="text-xl font-bold text-white">
                Comments ({comments.length})
              </h2>

              <button
                onClick={onClose}
                className="rounded-full p-2 transition hover:bg-white/10"
              >
                <HiXMark className="text-2xl text-white" />
              </button>
            </div>

            {/* Comments */}
            <div className="max-h-[450px] space-y-6 overflow-y-auto p-6">
              {comments.length === 0 ? (
                <p className="text-center text-slate-400">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="flex gap-4"
                  >
                    <img
                      src={comment.user?.avatar || "https://i.pravatar.cc/150?img=0"}
                      alt={comment.user?.fullName || "User"}
                      className="h-11 w-11 rounded-full object-cover"
                    />

                    <div className="flex-1">
                      <div className="rounded-2xl bg-white/5 p-4">
                        <div className="flex items-center gap-2">
                          

                          <span className="text-sm text-slate-500">
                            {comment.user?.username || "unknown"}
                          </span>

                          <span className="text-xs text-slate-600">
                            • {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>

                        <p className="mt-2 text-slate-300">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 border-t border-white/10 p-5">
              <input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={submitting}
                className="
                  flex-1
                  rounded-xl
                  bg-white/5
                  px-4
                  py-3
                  text-white
                  outline-none
                  placeholder:text-slate-500
                  disabled:opacity-50
                "
              />

              <button
                onClick={addComment}
                disabled={submitting || !newComment.trim()}
                className="
                  group
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-cyan-500
                  px-5
                  py-3
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:scale-105
                  disabled:opacity-50
                  disabled:hover:scale-100
                "
              >
                <span>{submitting ? "Sending..." : "Send"}</span>

                <HiOutlinePaperAirplane className="transition group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
