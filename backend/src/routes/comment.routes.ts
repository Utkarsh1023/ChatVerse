import express from "express";
import {
  createComment,
  getComments,
} from "../controllers/comment.controller";

import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", protect, createComment);

router.get("/:postId", getComments);

export default router;