import { Router } from "express";

import protect from "../middleware/auth.middleware";

import {
  getUsers,
  getMessages,
  getConversations,
  sendMessage,
} from "../controllers/chat.controller";

const router = Router();

router.use(protect);

router.get("/users", getUsers);

router.get("/conversations", getConversations);

router.get("/messages/:receiverId", getMessages);

router.post("/message", sendMessage);

export default router;