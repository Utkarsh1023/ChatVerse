import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import {
  getDashboard,
  acceptRequest,
  rejectRequest,
  removeFriendController,
} from "../controllers/friends.controller";

const router = express.Router();

/**
 * Friends Dashboard routes (mounted at /api/friends).
 *
 *   GET    /api/friends/dashboard   → single request for the whole page
 *   POST   /api/friends/accept/:id  → accept a pending request
 *   POST   /api/friends/reject/:id  → reject a pending request
 *   DELETE /api/friends/:id         → remove a friendship
 *
 * Legacy routes (GET /friends, GET /requests, POST /request/:id,
 * PUT /accept/:id, PUT /reject/:id) remain in friend.routes.ts and keep
 * working so the existing frontend is not broken.
 */

router.get("/dashboard", verifyToken, getDashboard);

router.post("/accept/:id", verifyToken, acceptRequest);

router.post("/reject/:id", verifyToken, rejectRequest);

router.delete("/:id", verifyToken, removeFriendController);

export default router;
