import Conversation from "../models/Conversation";
import mongoose from "mongoose";

export const getOrCreateConversation = async (participantA: string, participantB: string) => {
  const ids = [participantA, participantB].sort();

  // Ensure participants array is the same order for uniqueness check.
  // (For full production uniqueness, add a compound unique index on normalized participants.)
  const conversation = await Conversation.findOne({
    participants: { $all: ids.map((id) => new mongoose.Types.ObjectId(id)) },
    $expr: { $eq: [{ $size: "$participants" }, 2] },
  });

  if (conversation) return conversation;

  return Conversation.create({
    participants: ids.map((id) => new mongoose.Types.ObjectId(id)),
    unreadCount: {
      [participantA]: 0,
      [participantB]: 0,
    },
  });
};

