import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    media: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    caption: {
      type: String,
      default: "",
      maxlength: 150,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: {
        expires: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: fetch a single user's stories (grouped viewer) quickly,
// and sort them chronologically without an in-memory sort.
storySchema.index({ user: 1, createdAt: 1 });

export default mongoose.model("Story", storySchema);
