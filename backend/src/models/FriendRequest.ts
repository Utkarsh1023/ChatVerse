import mongoose, { Schema, Document, Types } from "mongoose";

export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export interface IFriendRequest extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// A sender can only have ONE pending request toward a given receiver.
friendRequestSchema.index({ sender: 1, receiver: 1, status: 1 });

// Fast lookup of all pending requests for a user (dashboard / notifications).
friendRequestSchema.index({ receiver: 1, status: 1, createdAt: -1 });

const FriendRequest = mongoose.model<IFriendRequest>(
  "FriendRequest",
  friendRequestSchema
);

export default FriendRequest;
