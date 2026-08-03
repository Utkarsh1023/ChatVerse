import express from "express";
import upload from "../middleware/upload.middleware";
import verifyToken from "../middleware/auth.middleware";
import {
  createPost,
  getFeed,
  toggleLike,
  toggleSave,
} from "../controllers/post.controller";

const router = express.Router();

// All post routes require authentication.
router.use(verifyToken);

router.post(
  "/create",
  // Multer parses multipart/form-data. Errors (file too large, unexpected
  // field, wrong MIME type) are mapped to a clean 400 instead of a 500.
  upload.single("media"),
  (err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }
    next();
  },
  createPost
);

// Paginated, privacy-aware feed.
router.get("/", getFeed);

// Like / unlike a post.
router.post("/:postId/like", toggleLike);

// Save / unsave (bookmark) a post.
router.post("/:postId/save", toggleSave);

export default router;

