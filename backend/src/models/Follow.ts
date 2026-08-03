import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFollow extends Document {
  follower: Types.ObjectId;
  following: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// A follower can only follow a given user once.
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Fast lookup of all users a person follows.
followSchema.index({ follower: 1, createdAt: -1 });

// Fast lookup of all followers of a user.
followSchema.index({ following: 1, createdAt: -1 });

const Follow = mongoose.model<IFollow>("Follow", followSchema);

export default Follow;

