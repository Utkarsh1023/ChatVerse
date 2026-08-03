import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {Link} from "react-router-dom";
import CommentsModal from "./CommentModal";
import { getComments, createComment, CommentData } from "../../api/commentApi";
import { toggleLike } from "../../api/postApi";
import { useAuth } from "../../context/AuthContext";

import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineChatBubbleOvalLeft,
  HiOutlinePaperAirplane,
  HiOutlineBookmark,
  HiBookmark 
} from "react-icons/hi2";

export interface PostMedia {
  url: string;
  public_id: string;
  type: "image" | "video" | "raw" | "audio";
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  thumbnailUrl?: string;
}

type PostProps = {
  postId: string;
  user: string;
  username: string;
  avatar: string;
  media: PostMedia[];
  caption: string;
  likesCount: number;
  initialLiked: boolean;
  comments: number;
  time: string;
};

export default function PostCard({
  postId,
  user,
  username,
  avatar,
  media,
  caption,
  likesCount,
  initialLiked,
  time,
}: PostProps) {
  // A single media item is rendered directly; carousels can be added later.
  const mediaItem = media[0];
  const isVideo = mediaItem?.type === "video";
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(likesCount);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentList, setCommentList] = useState<CommentData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await getComments(postId);
      setCommentList(res.data.comments);
    } catch (error: any) {
      console.error("Failed to fetch comments:", error?.response?.data?.message || error?.message || error);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Sync liked state if initialLiked changes (e.g., posts refetch)
  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(likesCount);
  }, [initialLiked, likesCount]);

  const handleLikeToggle = async () => {
    if (likeLoading) return;
    setLikeLoading(true);

    // Optimistic update
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const res = await toggleLike(postId);
      // Sync with server response
      setLiked(res.data.isLiked);
      setLikeCount(res.data.likesCount);
    } catch (err: any) {
      // Revert on error
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
      console.error("Failed to toggle like:", err?.response?.data?.message || err?.message || err);
    } finally {
      setLikeLoading(false);
    }
  };

  const addComment = async () => {
    if (!commentInput.trim() || submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      const res = await createComment(postId, commentInput.trim());

      setCommentList((prev) => [res.data.comment, ...prev]);
      setCommentInput("");
      setShowComments(true);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to add comment. Please try again.";
      setError(message);
      console.error("Failed to add comment:", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentAdded = useCallback((newComment: CommentData) => {
    setCommentList((prev) => [newComment, ...prev]);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addComment();
    }
  };
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="mb-4 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4">
          <Link to={`/dashboard/profile/${username}`}>
            <img
              src={avatar}
              alt={user}
              className="h-8 w-8 rounded-full object-cover cursor-pointer transition hover:scale-105"
            />
          </Link>
          <div>
            <Link to={`/dashboard/profile/${username}`}>
            {/* <h3 className="font-semibold text-white">{user}</h3> */}
            <div className="flex items-center gap-2 text-sm text-white">
              <span>{username}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">{time}</span>
            </div>
            </Link>
          </div>
        </div>
        
      </div>

      {/* Media (image or video) */}
      <div className="overflow-hidden">
        {isVideo ? (
          <video
            src={mediaItem?.url}
            poster={mediaItem?.thumbnailUrl}
            controls
            preload="metadata"
            className="h-[500px] w-full object-cover"
          />
        ) : (
          <motion.img
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4 }}
            src={mediaItem?.url}
            alt="Post"
            className="h-[500px] w-full object-cover"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-5 pt-2">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLikeToggle}
            disabled={likeLoading}
          >
            {liked ? (
              <HiHeart className="text-3xl text-red-500" />
            ) : (
              <HiOutlineHeart className="text-3xl text-white hover:text-red-400" />
            )}
          </motion.button>
          <span className="text-sm font-semibold text-white">
            {likeCount}
          </span>
          <button onClick={() => setShowComments(true)}>
            <HiOutlineChatBubbleOvalLeft className="text-3xl text-white hover:text-cyan-400" />
          </button>
          <span className="text-sm font-semibold text-white">
            {commentList.length}
          </span>
        </div>
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className="group rounded-full p-2 transition-all duration-300 hover:bg-white/10"
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
        >
          {bookmarked ? (
            <HiBookmark className="text-3xl text-yellow-400 transition-transform group-hover:scale-110" />
          ) : (
            <HiOutlineBookmark className="text-3xl text-white transition-transform group-hover:scale-110 group-hover:text-yellow-400" />
          )}
        </button>
      </div>

      {/* Caption */}
      <div className="px-5 pt-1">
        <p className="text-slate-300">
          <span className="mr-2 font-bold text-white">{username}</span>
          {caption}
        </p>
      </div>


      {/* Comment Box */}
      <div className="border-t border-white/10 mt-5">
        {error && (
          <div className="px-5 pt-3">
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          </div>
        )}
        <div className="flex items-center gap-3 px-5 py-4">
          <input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment..."
            disabled={submitting}
            className="w-full bg-transparent text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
          />
          <button
            onClick={addComment}
            disabled={submitting || !commentInput.trim()}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
          >
            <span>{submitting ? "Sending..." : "Comment"}</span>
            <HiOutlinePaperAirplane className="text-lg group-hover:translate-x-1 transition" />
          </button>
        </div>
        <CommentsModal
          postId={postId}
          open={showComments}
          onClose={() => setShowComments(false)}
          comments={commentList}
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </motion.article>
  );
}

