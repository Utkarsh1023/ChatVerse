import mongoose, { Document, Schema } from "mongoose";

export type MediaType = "image" | "video";

export interface IMedia extends Document {
  url: string;
  publicId: string;
  type: MediaType;
  width?: number;
  height?: number;
}

const mediaSchema = new Schema<IMedia>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
  },
  { _id: false }
);

export const MediaSchema = mediaSchema;

// Dedicated model (optional). We’ll mostly embed this schema into Post.
export default mongoose.models.Media || mongoose.model<IMedia>("Media", mediaSchema);

