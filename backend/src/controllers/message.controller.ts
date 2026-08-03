import { Request, Response } from "express";
import mongoose from "mongoose";
import fs from "fs";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import cloudinary from "../config/cloudinary";

/** Best-effort removal of the multer temp file. Never throws. */
const removeTempFile = (filePath?: string) => {
  if (!filePath) return;
  try {
    fs.unlinkSync(filePath);
  } catch (err: any) {
    console.warn("⚠️ Could not delete temp file:", err?.message);
  }
};

/**
 * POST /api/messages/upload
 * Uploads a single file (multer -> temp disk file) and returns a ready-to-use
 * attachment descriptor. Tries Cloudinary first; falls back to the local
 * /uploads folder when Cloudinary credentials are missing or the upload fails.
 */
export const uploadMessageAttachment = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { path: filePath, mimetype, size, originalname } = req.file;
    const safeName = originalname || "file";

    const cloudOk =
      process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET;

    if (cloudOk) {
      try {
        const upload = await cloudinary.uploader.upload(filePath, {
          resource_type: "auto",
          folder: "uchat/attachments",
        });
        removeTempFile(filePath);

        return res.status(201).json({
          success: true,
          attachment: {
            url: upload.secure_url,
            filename: safeName,
            size,
            mimeType: mimetype,
            public_id: upload.public_id,
          },
        });
      } catch (uploadErr: any) {
        console.warn(
          "⚠️ Cloudinary upload failed, falling back to local /uploads:",
          uploadErr?.message || uploadErr
        );
        // Fall through to the local-storage path below.
      }
    }

    // Local fallback — /uploads is served statically by the backend.
    const localUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      attachment: {
        url: localUrl,
        filename: safeName,
        size,
        mimeType: mimetype,
      },
    });
  } catch (error: any) {
    console.error("uploadMessageAttachment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload attachment",
    });
  }
};

/**
 * GET /api/messages/:conversationId
 * Returns all messages belonging to the conversation, as long as the
 * authenticated user is a participant.
 */
export const getMessagesByConversation = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const userId = req.user.id;
    const conversationId = String(req.params.conversationId);

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversationId",
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversationId,
    })
      .sort({ createdAt: 1 })
      .limit(200);

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("getMessagesByConversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load messages",
    });
  }
};

/**
 * POST /api/messages
 * Sends a new message in a conversation. If the conversation does not exist
 * yet (edge case), it will be created. Returns the created message.
 */
export const sendMessage = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const senderId = req.user.id;
    const { conversationId, receiverId, text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    let conversation: any = null;

    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        participants: senderId,
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }
    } else if (receiverId) {
      // Create-or-find fallback so POST /api/messages works without a conversationId.
      conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "conversationId or receiverId is required",
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId: receiverId || conversation.participants.find(
        (p: any) => p.toString() !== senderId
      ),
      text,
      status: "sent",
    });

    conversation.lastMessage = message._id as mongoose.Types.ObjectId;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

