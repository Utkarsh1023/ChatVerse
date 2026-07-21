import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { uploadPost as uploadPostController } from "../controllers/uploadPost.controller";
import { uploadPost as uploadPostFiles } from "./uploadPostFiles";

const router = Router();

// Upload first (cloudinary), then client calls POST /api/posts
router.post("/post", protect, uploadPostFiles, uploadPostController);

export default router;

