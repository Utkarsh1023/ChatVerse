import { Request, Response } from "express";
import mongoose from "mongoose";
import Comment from "../models/comment.model";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * POST /api/comments
 * Create a new comment on a post
 */
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const postId = Array.isArray(req.body.postId)
      ? req.body.postId[0]
      : req.body.postId;
    const text = Array.isArray(req.body.text) ? req.body.text[0] : req.body.text;

    // ---------- Validation ----------
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "A valid postId is required",
      });
    }

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required and must be a non-empty string",
      });
    }

    // ---------- Check post exists ----------
    const postExists = await Post.findById(postId).select("_id");
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // ---------- Create comment ----------
    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      text: text.trim(),
    });

    // Populate user details for the response
    await comment.populate("user", "fullName username avatar");

    console.log(`[COMMENT] Created comment ${comment._id} on post ${postId}`);

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (err: any) {
    console.error("[COMMENT] Create Comment Error:", err.message || err);

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(err.errors).map((e: any) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while creating comment",
    });
  }
};

/**
 * GET /api/comments/:postId
 * Fetch all comments for a post
 */
export const getComments = async (req: Request, res: Response) => {
  try {
    const postId = Array.isArray(req.params.postId)
      ? req.params.postId[0]
      : req.params.postId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid postId format",
      });
    }

    const comments = await Comment.find({ post: postId })
      .populate("user", "fullName username avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      comments,
    });
  } catch (err: any) {
    console.error("[COMMENT] Get Comments Error:", err.message || err);

    res.status(500).json({
      success: false,
      message: "Internal server error while fetching comments",
    });
  }
};
