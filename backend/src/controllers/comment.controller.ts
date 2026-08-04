import { Response } from "express";
import mongoose from "mongoose";
import Comment from "../models/Comment";
import Post from "../models/Post";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { AuthRequest } from "../middleware/verifyToken";
import { createNotification } from "../services/notification.service";

// Fields of the user we expose on each comment. `name` is mapped to
// `fullName` by the User model's virtual, which the frontend reads.
const USER_SELECT = "_id name username avatar";

// ---------------------------------------------------------------------------
// Create Comment
// ---------------------------------------------------------------------------

export const createComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const { postId, text } = req.body as { postId?: string; text?: string };

    if (!postId || !mongoose.isValidObjectId(postId)) {
      throw new ApiError(400, "Invalid post id");
    }

    const content = (text ?? "").toString().trim();
    if (!content) {
      throw new ApiError(400, "Comment text is required");
    }
    if (content.length > 1000) {
      throw new ApiError(400, "Comment cannot exceed 1000 characters");
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.create({
      post: postId,
      user: userId,
      text: content,
    });

// Keep the post's denormalized `comments` array + `commentsCount` in sync.
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
      $inc: { commentsCount: 1 },
    });

    // 🔔 Notify the post author when someone comments on their post.
    // createNotification already skips self-notifications (commenter === author).
    await createNotification({
      recipient: post.author,
      sender: userId,
      type: "comment_post",
      post: postId,
      comment: comment._id,
    });

    await comment.populate("user", USER_SELECT);

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  }
);

// ---------------------------------------------------------------------------
// Get Comments for a Post (newest-first to match the frontend's prepend)
// ---------------------------------------------------------------------------

export const getComments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;

    if (!mongoose.isValidObjectId(postId)) {
      throw new ApiError(400, "Invalid post id");
    }

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("user", USER_SELECT)
      .lean();

    res.json({
      success: true,
      comments,
    });
  }
);

// ---------------------------------------------------------------------------
// Delete Comment (owner only)
// ---------------------------------------------------------------------------

export const deleteComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { commentId } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    if (!mongoose.isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment id");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    // Ownership check — only the author of the comment may delete it.
    if (String(comment.user) !== String(userId)) {
      throw new ApiError(403, "You can only delete your own comments");
    }

    const postId = comment.post;

    await Comment.findByIdAndDelete(commentId);

    // Keep the post's denormalized `comments` array + `commentsCount` in sync.
    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: commentId },
      $inc: { commentsCount: -1 },
    });

    res.json({
      success: true,
      message: "Comment deleted successfully",
      commentId,
    });
  }
);

// ---------------------------------------------------------------------------
// Toggle Like on a Comment
// ---------------------------------------------------------------------------

export const toggleCommentLike = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { commentId } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    if (!mongoose.isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment id");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    const liked = comment.likes.some((id) => id.toString() === userId);

    if (liked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(new mongoose.Types.ObjectId(userId));
    }

    await comment.save(); // pre-save hook recomputes likesCount

    res.json({
      success: true,
      isLiked: !liked,
      likesCount: comment.likesCount,
    });
  }
);

