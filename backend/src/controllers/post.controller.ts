import { Response } from "express";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary";
import Post, { MediaType, PostPrivacy } from "../models/Post";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import fs from "fs";
import { AuthRequest } from "../middleware/auth.middleware";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Best-effort removal of the multer temp file. Never throws — post creation
 * must not fail because a temp file could not be cleaned up.
 */
const removeTempFile = (filePath?: string) => {
  if (!filePath) return;
  try {
    fs.unlinkSync(filePath);
  } catch (err: any) {
    console.warn("⚠️ Could not delete temp file:", err?.message);
  }
};

/**
 * Rollback a Cloudinary upload if the DB insert fails. Without this, an orphan
 * asset stays on Cloudinary and leaks storage/cost forever.
 */
const destroyCloudinaryAsset = async (
  publicId: string,
  resourceType: string
) => {
  try {
    const type = resourceType === "video" ? "video" : "image";
    await cloudinary.uploader.destroy(publicId, { resource_type: type });
    console.log("🧹 Rolled back orphan Cloudinary asset:", publicId);
  } catch (err: any) {
    console.warn("⚠️ Cloudinary rollback failed for", publicId, err?.message);
  }
};

const sanitizeTags = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => String(t).trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 30);
};

// ---------------------------------------------------------------------------
// Create Post
// ---------------------------------------------------------------------------

export const createPost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // 1) Authenticated user guard.
    if (!req.user?.id) {
      throw new ApiError(401, "Unauthorized");
    }

    // 2) Multer should have attached the file — bail if missing.
    if (!req.file) {
      throw new ApiError(400, "Media is required");
    }

    const { caption, privacy, location, tags } = req.body;

    // 3) Validate privacy enum early (cheap, before hitting Cloudinary).
    if (
      privacy !== undefined &&
      !Object.values(PostPrivacy).includes(privacy)
    ) {
      removeTempFile(req.file.path);
      throw new ApiError(
        400,
        `Invalid privacy. Must be one of: ${Object.values(PostPrivacy).join(", ")}`
      );
    }

    // 4) Upload to Cloudinary. On failure, clean up the temp file and throw
    //    a 502 (Bad Gateway) — the origin (Cloudinary) is unreachable/misbehaving.
    let upload;
    try {
      upload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "uchat/posts",
        // Auto-generate a video poster so feeds don't load the full video
        // just to show a thumbnail.
        ...(req.file.mimetype.startsWith("video/")
          ? { eager: [{ transformation: [{ width: 640, crop: "scale" }] }] }
          : {}),
        eager_async: req.file.mimetype.startsWith("video/"),
      });
    } catch (uploadErr: any) {
      removeTempFile(req.file.path);
      throw new ApiError(
        502,
        "Media upload to Cloudinary failed",
        uploadErr?.message || String(uploadErr)
      );
    }

    // 5) Temp file cleanup (best-effort) BEFORE the DB write so a failed
    //    insert never leaves a file behind.
    removeTempFile(req.file.path);

    // 6) Persist the post. If the DB write fails, roll back the Cloudinary
    //    upload so we don't leak orphaned media.
    const post = await Post.create({
      author: req.user.id,
      caption: (caption ?? "").toString().trim().slice(0, 2200),
      media: [
        {
          url: upload.secure_url,
          public_id: upload.public_id,
          type: upload.resource_type as MediaType, // "image" | "video" | "raw"
          format: upload.format,
          width: upload.width,
          height: upload.height,
          duration: upload.duration,
          size: upload.bytes,
          thumbnailUrl:
            upload.resource_type === "video"
              ? upload.eager?.[0]?.secure_url ?? ""
              : "",
        },
      ],
      privacy: privacy ?? PostPrivacy.PUBLIC,
      location: (location ?? "").toString().trim().slice(0, 255),
      tags: sanitizeTags(tags),
    }).catch(async (dbErr) => {
      await destroyCloudinaryAsset(upload.public_id, upload.resource_type);
      throw dbErr;
    });

    // 7) Populate author for immediate rendering on the client.
    await post.populate("author", "name username avatar");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  }
);

// ---------------------------------------------------------------------------
// Get Feed (privacy-aware, cursor-paginated)
// ---------------------------------------------------------------------------

export const getFeed = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const viewerId = req.user?.id;

    // Cursor = the createdAt of the last post from the previous page.
    const cursor = req.query.cursor as string | undefined;
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string, 10) || 10, 1),
      50
    );

    // Build the visibility filter:
    //   - public posts: everyone
    //   - followers-only: only the author's followers (list sourced elsewhere;
    //     this example treats the viewer as allowed — integrate your follow graph)
    //   - private: only the author
    const query: any = {
      privacy: PostPrivacy.PUBLIC,
      isArchived: false,
    };

    if (viewerId) {
      query.$or = [
        { privacy: PostPrivacy.PUBLIC },
        { author: viewerId }, // own posts (incl. private)
        // NOTE: extend with `{ author: { $in: followingIds } }` when the
        // follow graph exists, and scope `followers` privacy to it.
      ];
    }

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("author", "name username avatar")
      .lean();

    const enriched = posts.map((post) => ({
      ...post,
      isLiked: viewerId
        ? (post.likes as unknown as string[]).some(
            (id) => id.toString() === viewerId
          )
        : false,
      isSaved: viewerId
        ? (post.savedBy as unknown as string[]).some(
            (id) => id.toString() === viewerId
          )
        : false,
    }));

    res.json({
      success: true,
      posts: enriched,
      pagination: {
        hasMore: enriched.length === limit,
        nextCursor:
          enriched.length === limit
            ? enriched[enriched.length - 1].createdAt
            : null,
      },
    });
  }
);

// ---------------------------------------------------------------------------
// Toggle Like
// ---------------------------------------------------------------------------

export const toggleLike = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Unauthorized");

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const liked = post.likes.some((id) => id.toString() === userId);

    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(new mongoose.Types.ObjectId(userId));
    }

    await post.save(); // pre-save hook recomputes likesCount

    res.json({
      success: true,
      isLiked: !liked,
      likesCount: post.likesCount,
    });
  }
);

// ---------------------------------------------------------------------------
// Toggle Save (bookmark)
// ---------------------------------------------------------------------------

export const toggleSave = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Unauthorized");

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const saved = post.savedBy.some((id) => id.toString() === userId);

    if (saved) {
      post.savedBy = post.savedBy.filter((id) => id.toString() !== userId);
    } else {
      post.savedBy.push(new mongoose.Types.ObjectId(userId));
    }

    await post.save(); // pre-save hook recomputes savedCount

    res.json({
      success: true,
      isSaved: !saved,
      savedCount: post.savedCount,
    });
  }
);

