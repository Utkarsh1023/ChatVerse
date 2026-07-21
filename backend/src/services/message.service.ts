import Message, { type IMessage, type MessageStatus } from "../models/Message";
import Conversation from "../models/Conversation";

export const createMessage = async (params: {
  senderId: string;
  receiverId: string;
  conversationId: string;
  text?: string;
  attachments?: Array<{ url: string; filename?: string }>;
}): Promise<IMessage> => {
  const { senderId, receiverId, conversationId, text, attachments } = params;

  return Message.create({
    sender: senderId,
    receiver: receiverId,
    conversation: conversationId,
    text: text ?? "",
    attachments: attachments ?? [],
    status: "sent",
    edited: false,
    deleted: false,
  });
};

export const updateMessageStatus = async (messageId: string, status: MessageStatus) => {
  return Message.findByIdAndUpdate(messageId, { status }, { new: true });
};

export const setConversationLastMessage = async (conversationId: string, messageId: string) => {
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: messageId,
  });
};

