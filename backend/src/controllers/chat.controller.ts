import { Request, Response } from "express";
import mongoose from "mongoose";

import User from "../models/User";
import Conversation from "../models/Conversation";
import Message from "../models/Message";

export const getUsers = async (
  req: any,
  res: Response
) => {
  const users = await User.find({
    _id: { $ne: req.userId },
  }).select("-password");

  res.json(users);
};

export const getMessages = async (
  req: any,
  res: Response
) => {
  const senderId = req.userId;

  const receiverId = req.params.receiverId;

  let conversation =
    await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });

  if (!conversation)
    return res.json({
      messages: [],
    });

  const messages =
    await Message.find({
      conversationId: conversation._id,
    }).sort({
      createdAt: 1,
    });

  res.json({
    messages,
  });
};

export const sendMessage = async (
  req: any,
  res: Response
) => {
  const senderId = req.userId;

  const { receiverId, text } = req.body;

  let conversation =
    await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });

  if (!conversation) {
    conversation =
      await Conversation.create({
        participants: [
          senderId,
          receiverId,
        ],
      });
  }

  const message =
    await Message.create({
      conversationId:
        conversation._id,
      senderId,
      receiverId,
      text,
    });

  conversation.lastMessage =
    message._id as mongoose.Types.ObjectId;

  await conversation.save();

  res.status(201).json(message);
};

export const getConversations =
  async (req: any, res: Response) => {
    const userId = req.userId;

    const conversations =
      await Conversation.find({
        participants: userId,
      })
        .populate(
          "participants",
          "name username avatar isOnline lastSeen isVerified"
        )
        .populate("lastMessage")
        .sort({
          updatedAt: -1,
        });

    const result = conversations.map(
      (c: any) => ({
        _id: c._id,
        updatedAt: c.updatedAt,
        lastMessage: c.lastMessage,
        user: c.participants.find(
          (p: any) =>
            p._id.toString() !== userId
        ),
      })
    );

    res.json(result);
  };
