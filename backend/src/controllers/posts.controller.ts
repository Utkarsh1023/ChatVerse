import { Response } from "express";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/auth.middleware";
import mongoose from "mongoose";

export const createPost = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    console.log("========== CREATE POST ==========");
    console.log("User:", req.user);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Media is required",
      });
    }

    const post = await Post.create({
      user: req.user!._id,
      caption: req.body.caption || "",
      mediaUrl: `/uploads/posts/${req.file.filename}`,
      mediaType: req.file.mimetype.startsWith("image")
        ? "image"
        : "video",
    });

    console.log("Post Created:", post);

    await post.populate("user", "name username avatar");

    return res.status(201).json({
      success: true,
      post,
    });

  } catch (err: any) {
    console.error("========== CREATE POST ERROR ==========");
    console.error(err);
    console.error(err.stack);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//GET POSTS with isLiked status
export const getPosts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const posts = await Post.find()
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });

    // Attach isLiked for each post based on the authenticated user
    const userId = req.user?._id;
    const postsWithLikeStatus = posts.map((post) => ({
      ...post.toObject(),
      isLiked: userId ? post.likes.some((likeId: any) => likeId.toString() === userId.toString()) : false,
    }));

    return res.status(200).json({
      success: true,
      posts: postsWithLikeStatus,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch posts",
    });
  }
};

// TOGGLE LIKE
export const toggleLike = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { postId } = req.params;
    const userId = req.user!._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.some(
      (likeId: any) => likeId.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Remove like (Array of ObjectId doesn't have Mongoose array helpers in TS typings)
      post.likes = post.likes.filter((likeId: any) => likeId.toString() !== userId.toString());
      await post.save();
    } else {
      // Add like
      post.likes.push(userId);
      await post.save();
    }

    return res.status(200).json({
      success: true,
      isLiked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Unable to toggle like",
    });
  }
};
