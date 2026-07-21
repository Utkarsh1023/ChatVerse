import mongoose, { Document, Schema, Types } from "mongoose";

export type MessageStatus = "sent" | "delivered" | "seen";

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  conversation: Types.ObjectId;

  text?: string;
  attachments: Array<{ url: string; filename?: string }>;

  status: MessageStatus;
  edited: boolean;
  deleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },

    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },

    text: { type: String, default: "" },
    attachments: {
      type: [
        {
          url: { type: String, required: true },
          filename: { type: String },
        },
      ],
      default: [],
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
      index: true,
    },

    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", messageSchema);

