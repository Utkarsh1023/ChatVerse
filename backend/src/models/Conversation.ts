import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  unreadCount: Record<string, number>; // userId -> unreadCount

  updatedAt: Date;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message", default: null },
    unreadCount: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model<IConversation>("Conversation", conversationSchema);

