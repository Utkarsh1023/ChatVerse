import mongoose, { Document, Schema } from "mongoose";

export interface ISave extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
}

const saveSchema = new Schema<ISave>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  },
  { timestamps: true }
);

saveSchema.index({ user: 1, post: 1 }, { unique: true });

export default mongoose.models.Save || mongoose.model<ISave>("Save", saveSchema);

