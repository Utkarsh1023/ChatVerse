import mongoose, { Schema, Document, Types } from "mongoose";
import {
  NotificationType,
  NOTIFICATION_TYPES,
} from "../types/notification";

export interface INotification extends Document {
  /** The user who receives the notification. */
  recipient: Types.ObjectId;
  /** The user who triggered the notification (actor). Optional for "system". */
  sender?: Types.ObjectId;
  type: NotificationType;
  post?: Types.ObjectId;
  comment?: Types.ObjectId;
  story?: Types.ObjectId;
  message?: Types.ObjectId;
  conversation?: Types.ObjectId;
  read: boolean;
  /** Action status for actionable notifications (e.g. friend_request). */
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: [true, "Notification type is required"],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    story: {
      type: Schema.Types.ObjectId,
      ref: "Story",
      default: null,
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes — performance for the two hottest queries:
//  1. "latest activity feed" per recipient (sorted newest first)
//  2. "unread badge count" per recipient
// ---------------------------------------------------------------------------

// Newest-first feed per recipient. Skip the `_id` tiebreaker (rarely needed).
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Fast unread counting + filtering unread notifications.
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export default Notification;
