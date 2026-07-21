import Message, { type MessageStatus } from "../models/Message";
import Conversation from "../models/Conversation";
import mongoose from "mongoose";

export const updateDelivered = async (params: {
  messageId?: string;
  clientMessageId?: string;
  receiverId: string;
  // senderId is derived from the Message itself
}) => {
  const { messageId, receiverId } = params;
  if (!messageId) throw new Error("messageId is required for DB update");

  const message = await Message.findById(messageId);
  if (!message) throw new Error("message not found");

  const senderId = message.sender.toString();

  // Only update if receiver matches.
  if (message.receiver.toString() !== receiverId) {
    return { senderId, receiverId, changed: false };
  }

  // Update status to delivered
  const updated = await Message.findByIdAndUpdate(
    messageId,
    { status: "delivered" as MessageStatus },
    { new: true }
  );

  // Conversation lastMessage is already set on create; no need here.
  // Conversation unreadCount: delivered shouldn't change unread count.
  return { senderId, receiverId, changed: !!updated };
};

export const updateSeen = async (params: {
  messageId?: string;
  receiverId: string;
}) => {
  const { messageId, receiverId } = params;
  if (!messageId) throw new Error("messageId is required for DB update");

  const message = await Message.findById(messageId);
  if (!message) throw new Error("message not found");

  const senderId = message.sender.toString();
  const conversationId = message.conversation.toString();

  // Ensure receiver matches
  if (message.receiver.toString() !== receiverId) {
    return { senderId, receiverId, changed: false, conversationId };
  }

  // Update message status to seen
  const updated = await Message.findByIdAndUpdate(
    messageId,
    { status: "seen" as MessageStatus },
    { new: true }
  );

  // Update unreadCount: reset unreadCount for receiver
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: {
      [`unreadCount.${receiverId}`]: 0,
    },
  });

  return { senderId, receiverId, changed: !!updated, conversationId };
};

export const incrementUnreadForReceiver = async (conversationId: string, receiverId: string, amount = 1) => {
  await Conversation.findByIdAndUpdate(conversationId, {
    $inc: {
      [`unreadCount.${receiverId}`]: amount,
    },
  });
};


