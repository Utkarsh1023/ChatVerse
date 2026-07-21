import { Response } from "express";
import Message from "../models/Message";
import { getOrCreateConversation } from "../services/conversation.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    // req.params values can be string | string[] depending on routing; normalize to string
    let { receiverId } = req.params as { receiverId?: string | string[] };
    if (Array.isArray(receiverId)) receiverId = receiverId[0];
    const senderId = req.user!._id.toString();

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    // Get or create the conversation between the two users
    const conversation = await getOrCreateConversation(senderId, receiverId);

    // Fetch all messages for this conversation, sorted by createdAt ascending
    const messages = await Message.find({
      conversation: conversation._id,
      deleted: false,
    })
      .sort({ createdAt: 1 })
      .lean();

    // Map to frontend-friendly format
    const formattedMessages = messages.map((msg) => ({
      id: msg._id.toString(),
      conversationId: msg.conversation.toString(),
      senderId: msg.sender.toString(),
      receiverId: msg.receiver.toString(),
      text: msg.text,
      attachments: msg.attachments,
      status: msg.status,
      edited: msg.edited,
      deleted: msg.deleted,
      createdAt: msg.createdAt.toISOString(),
    }));

    return res.status(200).json({
      success: true,
      messages: formattedMessages,
      conversationId: conversation._id.toString(),
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch messages",
    });
  }
};

