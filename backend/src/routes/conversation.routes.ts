import { Router } from "express";
import {
  getConversations,
  createOrGetConversation,
} from "../controllers/conversation.controller";
import verifyToken from "../middleware/auth.middleware";

const router = Router();

router.get("/", verifyToken, getConversations);

router.post("/", verifyToken, createOrGetConversation);

export default router;
