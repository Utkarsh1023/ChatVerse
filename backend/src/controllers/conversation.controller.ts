import { Request, Response } from "express";
import mongoose from "mongoose";
import Conversation from "../models/Conversation";
import User from "../models/User";
/**
 * Builds the normalized conversation payload `{ _id, updatedAt, lastMessage, user }`
 * where `user` is the participant that is NOT the current user.
 */
const toConversationPayload = (c: any, userId: string) => ({
  _id: c._id,
  updatedAt: c.updatedAt,
  lastMessage: c.lastMessage || null,
  user: (c.participants || []).find(
    (p: any) => p._id.toString() !== userId
  ),
});

export const getConversations = async (
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

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate(
        "participants",
        "name username avatar isOnline lastSeen isVerified"
      )
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const result = conversations.map((c: any) =>
      toConversationPayload(c, userId)
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("getConversations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load conversations",
    });
  }
};

/**
 * Find an existing conversation between the current user and `receiverId`.
 * If none exists, create a new one. Always returns the normalized payload.
 */
export const createOrGetConversation = async (
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
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "receiverId is required",
      });
    }

    if (receiverId === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot start a conversation with yourself",
      });
    }

    // Guard against invalid ObjectIds (avoids a Mongoose CastError -> 500).
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiverId",
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, receiverId],
      });
    }

    const populated = await conversation.populate(
      "participants",
      "name username avatar isOnline lastSeen isVerified"
    );

    res.status(200).json(toConversationPayload(populated, userId));
  } catch (error) {
    console.error("createOrGetConversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to open conversation",
    });
  }
};

