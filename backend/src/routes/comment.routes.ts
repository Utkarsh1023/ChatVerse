import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import {
  createComment,
  getComments,
  deleteComment,
  toggleCommentLike,
} from "../controllers/comment.controller";

const router = Router();

// All comment routes require authentication.
router.use(verifyToken);

// Create a comment on a post. Body: { postId, text }
router.post("/", createComment);

// Get all comments for a post.
router.get("/:postId", getComments);

// Owner-only delete.
router.delete("/:commentId", deleteComment);

// Like / unlike a comment.
router.post("/:commentId/like", toggleCommentLike);

export default router;

