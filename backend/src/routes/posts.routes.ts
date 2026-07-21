import express from "express";
import { protect } from "../middleware/auth.middleware";
import { uploadPost } from "../middleware/upload.middleware";
import { createPost, getPosts, toggleLike } from "../controllers/posts.controller";

const router = express.Router();

router.get("/", protect, getPosts);
router.post(
  "/",
  protect,
  uploadPost.single("media"),
  createPost
);
router.post("/:postId/like", protect, toggleLike);

export default router;
