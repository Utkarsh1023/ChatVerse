import mongoose, { Document, Schema } from "mongoose";

export type NotificationType = "post" | "comment" | "like" | "share";

export interface INotification extends Document {
  receiver: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: NotificationType;
  post?: mongoose.Types.ObjectId | null;
  comment?: mongoose.Types.ObjectId | null;
  read: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["post", "comment", "like", "share"], required: true },

    post: { type: Schema.Types.ObjectId, ref: "Post", default: null, index: true },
    comment: { type: Schema.Types.ObjectId, ref: "Comment", default: null, index: true },

    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ receiver: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);

