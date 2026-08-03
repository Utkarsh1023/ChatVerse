import { Router } from "express";
import upload from "../middleware/upload.middleware";
import {
  uploadStory,
  getStories,
  getUserStories,
  deleteStory,
} from "../controllers/story.controller";
import {verifyToken} from "../middleware/verifyToken";

const router = Router();

router.post(
  "/",
  verifyToken,
  upload.single("media"),
  uploadStory
);

router.get("/", verifyToken, getStories);

// Single user's grouped stories (chronological).
router.get("/:userId", verifyToken, getUserStories);

// Owner-only delete.
router.delete("/:storyId", verifyToken, deleteStory);

export default router;

