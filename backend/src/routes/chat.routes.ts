import express from "express";
import { protect } from "../middleware/auth.middleware";
import { getMessages } from "../controllers/chat.controller";

const router = express.Router();

router.get("/messages/:receiverId", protect, getMessages);

export default router;

