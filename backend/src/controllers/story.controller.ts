import { Request, Response } from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Story from "../models/Story";

/** Fields of the user we expose on each story group. */
const USER_SELECT = "_id name username avatar";

/**
 * POST /api/stories
 * Upload a new story. Every upload simply creates a new Story document that
 * belongs to the SAME user — it never creates a separate "story circle". The
 * frontend groups all documents by user, so multiple uploads appear as one
 * circle.
 */
export const uploadStory = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Media is required",
      });
    }

    const story = await Story.create({
      user: req.user?.id,
      media: `/uploads/${req.file.filename}`,
      type: req.file.mimetype.startsWith("image") ? "image" : "video",
      caption: req.body.caption || "",
    });

    const populated = await story.populate("user", USER_SELECT);

    return res.status(201).json({
      success: true,
      message: "Story uploaded successfully",
      story: populated,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload story",
    });
  }
};

/**
 * GET /api/stories
 * Return ALL active stories GROUPED by user:
 *
 *   [
 *     { user: {...}, stories: [ {...}, {...} ] },  // one circle per user
 *     { user: {...}, stories: [ {...} ] }
 *   ]
 *
 * The logged-in user's own group is always placed first so the "Your Story"
 * circle appears at the front of the bar. Within each group, stories are
 * sorted oldest → newest (chronological playback order).
 */
export const getStories = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    const stories = await Story.find({
      expiresAt: { $gt: new Date() },
    })
      .populate("user", USER_SELECT)
      .sort({ createdAt: 1 });

    const groups = new Map<
      string,
      { user: any; stories: any[]; latestAt: Date }
    >();

    for (const story of stories) {
      const user = (story as any).user as any;
      if (!user || !user._id) continue;

      const userId = String(user._id);

      if (!groups.has(userId)) {
        groups.set(userId, {
          user,
          stories: [],
          latestAt: story.createdAt,
        });
      }

      const group = groups.get(userId)!;
      group.stories.push(story);
      if (story.createdAt > group.latestAt) {
        group.latestAt = story.createdAt;
      }
    }

    // Serialize: own group first, then everyone else by most-recent activity.
    const grouped = Array.from(groups.values())
      .sort((a, b) => {
        const aIsMine = a.user._id && String(a.user._id) === currentUserId;
        const bIsMine = b.user._id && String(b.user._id) === currentUserId;

        if (aIsMine && !bIsMine) return -1;
        if (!aIsMine && bIsMine) return 1;
        return b.latestAt.getTime() - a.latestAt.getTime();
      })
      .map(({ user, stories: s }) => ({
        user,
        stories: s.map((st) => ({
          _id: st._id,
          media: st.media,
          type: st.type,
          caption: st.caption,
          createdAt: st.createdAt,
          expiresAt: st.expiresAt,
          user,
        })),
      }));

    return res.status(200).json({
      success: true,
      stories: grouped,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stories",
    });
  }
};

/**
 * GET /api/stories/:userId
 * Return a single user's stories (chronological), used when opening their
 * circle. The requesting user must be authenticated.
 */
export const getUserStories = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const stories = await Story.find({
      user: userId,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", USER_SELECT)
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      stories,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user stories",
    });
  }
};

/**
 * DELETE /api/stories/:storyId
 * Delete a story — ONLY the owner can delete it. Removes the DB document AND
 * the media file from disk (if it lives in the local uploads folder).
 */
export const deleteStory = async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;
    const currentUserId = req.user?.id;

    if (!mongoose.isValidObjectId(storyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid story id",
      });
    }

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Ownership check — only the uploader may delete.
    if (String(story.user) !== String(currentUserId)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own stories",
      });
    }

    // Remove the media file from disk when it's a local upload.
    if (story.media && story.media.startsWith("/uploads/")) {
      const filename = story.media.replace("/uploads/", "");
      const filePath = path.join(process.cwd(), "uploads", filename);

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error("Failed to remove story media file:", err);
        // Non-fatal — continue deleting the DB record even if file cleanup fails.
      }
    }

    await Story.findByIdAndDelete(storyId);

    return res.status(200).json({
      success: true,
      message: "Story deleted successfully",
      storyId,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete story",
    });
  }
};

