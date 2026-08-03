import express, { Request, Response, NextFunction } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { uploadProfileImage } from "../middleware/upload.middleware";
import {
  getMyProfile,
  updateProfile,
  uploadAvatar,
  uploadCover,
  deleteAvatar,
  deleteCover,
  getProfileStats,
  getProfileByUsername,
  getProfileStatsByUsername,

  getProfilePosts,
  getFriends,
  getFollowers,
  getFollowing,
} from "../controllers/profile.controller";
import {
  updateProfileValidators,
  validateRequest,
} from "../validators/profile.validator";

const router = express.Router();

/**
 * Map multer upload errors (file too large, wrong MIME type, unexpected
 * field) to a clean 400 instead of falling through to the 500 handler.
 */
const handleMulterError = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof Error) {
    res.status(400).json({
      success: false,
      message: err.message || "File upload failed",
    });
    return;
  }
  next(err);
};

// All profile routes require authentication.
router.use(verifyToken);

// GET /api/profile/me — authenticated user's complete profile.
router.get("/me", getMyProfile);

// PUT /api/profile — update fullName / username / bio / country.
router.put("/", updateProfileValidators, validateRequest, updateProfile);

// PUT /api/profile/avatar — upload a new avatar.
router.put(
  "/avatar",
  uploadProfileImage.single("avatar"),
  handleMulterError,
  uploadAvatar
);

// PUT /api/profile/cover — upload a new cover.
router.put(
  "/cover",
  uploadProfileImage.single("cover"),
  handleMulterError,
  uploadCover
);

// DELETE /api/profile/avatar — remove avatar.
router.delete("/avatar", deleteAvatar);

// DELETE /api/profile/cover — remove cover.
router.delete("/cover", deleteCover);

// GET /api/profile/stats — authenticated user's own stats.
router.get("/stats", getProfileStats);

// GET /api/profile/posts/:username — fetch posts for a specific user.
// Resolved by USERNAME (matches useParams() on the frontend), never by userId.
router.get("/posts/:username", getProfilePosts);
// GET /api/profile/friends/:username — fetch friends for a specific user.
router.get("/friends/:username", getFriends);
// GET /api/profile/followers/:username — fetch followers for a specific user.
router.get("/followers/:username", getFollowers);
// GET /api/profile/following/:username — fetch following for a specific user.
router.get("/following/:username", getFollowing);

// GET /api/profile/:username/stats — ANOTHER user's real MongoDB counts.
router.get("/:username/stats", getProfileStatsByUsername);

// GET /api/profile/:username — fetch a profile by username.
router.get("/:username", getProfileByUsername);

export default router;

