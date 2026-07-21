import type { SocketUserId, SendMessagePayload } from "../socket/types";
import { getOrCreateConversation } from "../services/conversation.service";
import { createMessage, setConversationLastMessage } from "../services/message.service";

export const handleSendMessage = async (payload: SendMessagePayload & { senderIdAuth: SocketUserId }) => {
  const senderId = payload.senderIdAuth;
  const receiverId = payload.receiverId;

  const conversation = await getOrCreateConversation(senderId, receiverId);

  const message = await createMessage({
    senderId,
    receiverId,
    conversationId: conversation._id.toString(),
    text: payload.text,
    attachments: payload.attachments,
  });

  await setConversationLastMessage(conversation._id.toString(), message._id.toString());

  return {
    conversationId: conversation._id.toString(),
    messageId: message._id.toString(),
    createdAt: message.createdAt.toISOString(),
  };
};

