import { Router, Request, Response, NextFunction } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { uploadChatFile } from "../middleware/upload.middleware";
import {
  getMessagesByConversation,
  sendMessage,
  uploadMessageAttachment,
} from "../controllers/message.controller";

const router = Router();

/** Map multer upload errors to a clean 400 instead of a 500. */
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

// POST /api/messages/upload — single chat file attachment.
router.post(
  "/upload",
  verifyToken,
  uploadChatFile.single("file"),
  handleMulterError,
  uploadMessageAttachment
);

router.get("/:conversationId", verifyToken, getMessagesByConversation);

router.post("/", verifyToken, sendMessage);

export default router;

