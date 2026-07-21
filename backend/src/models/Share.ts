import mongoose, { Document, Schema } from "mongoose";

export interface IShare extends Document {
  sender: mongoose.Types.ObjectId;
  receiver?: mongoose.Types.ObjectId | null;
  post: mongoose.Types.ObjectId;
}

const shareSchema = new Schema<IShare>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  },
  { timestamps: true }
);

shareSchema.index({ post: 1, createdAt: -1 });

export default mongoose.models.Share || mongoose.model<IShare>("Share", shareSchema);

