import { Router } from "express";
import { getProfile, updateProfile, updateProfileAvatar } from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";
import { uploadAvatar } from "../middleware/upload.middleware";

const router = Router();

router.put("/profile", protect, updateProfile);
router.get("/profile", protect, getProfile);
router.post(
  "/profile/avatar",
  protect,
  uploadAvatar.single("avatar"),
  updateProfileAvatar
);

export default router;
