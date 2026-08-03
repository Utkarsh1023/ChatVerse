import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import {
  getDashboard,
  getFriends,
  getFollowers,
  getFollowing,
  getFriendRequests,
  getSuggestions,
  follow,
  unfollow,
  removeFollowerController,
} from "../controllers/connections.controller";

const router = express.Router();

/**
 * Connections routes (mounted at /api/connections).
 *
 *   GET    /api/connections/dashboard          → single request for the whole page
 *   GET    /api/connections/friends            → friends list only
 *   GET    /api/connections/followers          → followers list only
 *   GET    /api/connections/following          → following list only
 *   GET    /api/connections/friend-requests    → pending friend requests only
 *   GET    /api/connections/suggestions        → suggested users only
 *   POST   /api/connections/follow/:userId     → follow a user
 *   DELETE /api/connections/unfollow/:userId   → unfollow a user
 *   DELETE /api/connections/followers/:userId  → remove a follower
 */

router.get("/dashboard", verifyToken, getDashboard);
router.get("/friends", verifyToken, getFriends);
router.get("/followers", verifyToken, getFollowers);
router.get("/following", verifyToken, getFollowing);
router.get("/friend-requests", verifyToken, getFriendRequests);
router.get("/suggestions", verifyToken, getSuggestions);

router.post("/follow/:userId", verifyToken, follow);
router.delete("/unfollow/:userId", verifyToken, unfollow);
router.delete("/followers/:userId", verifyToken, removeFollowerController);

export default router;
