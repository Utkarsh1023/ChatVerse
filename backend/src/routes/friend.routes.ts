import express from "express";
import {verifyToken} from "../middleware/verifyToken";
import {
  getFriends,
  getRequests,
  sendFriendRequest,
  acceptRequest,
  rejectRequest,
} from "../controllers/friend.controller";

const router = express.Router();

router.get("/friends", verifyToken, getFriends);

router.get("/requests", verifyToken, getRequests);

router.post("/request/:id", verifyToken, sendFriendRequest);

router.put("/accept/:id", verifyToken, acceptRequest);

router.put("/reject/:id", verifyToken, rejectRequest);

export default router;