import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;

  senderId: mongoose.Types.ObjectId;

  receiverId: mongoose.Types.ObjectId;

  text: string;

  attachments: string[];

  status: "sent" | "delivered" | "seen";

  edited: boolean;

  deleted: boolean;

  seenAt?: Date;

  deliveredAt?: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    attachments: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    edited: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
    },

    seenAt: Date,

    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMessage>(
  "Message",
  MessageSchema
);