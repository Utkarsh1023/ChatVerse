import mongoose, { Schema, Document, Types } from "mongoose";

export type NotificationType =
  | "friend_request_received"
  | "friend_request_accepted"
  | "new_follower"
  | "friend_removed"
  | "friend_accepted"
  | "system";

export interface INotification extends Document {
  /** The user who receives the notification. */
  user: Types.ObjectId;
  /** The user who triggered the notification (actor). */
  actor?: Types.ObjectId;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "friend_request_received",
        "friend_request_accepted",
        "new_follower",
        "friend_removed",
        "friend_accepted",
        "system",
      ],
      default: "system",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Fast "latest activity" query per user.
notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export default Notification;
