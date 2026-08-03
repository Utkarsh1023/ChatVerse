import mongoose, { Schema, Document, Types } from "mongoose";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface IComment extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
  text: string;
  likes: Types.ObjectId[];
  likesCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Comment schema
// ---------------------------------------------------------------------------

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required"],
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: { type: Number, default: 0, min: 0 },

    isEdited: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// Fetch comments for a post, oldest-first (thread order).
commentSchema.index({ post: 1, createdAt: 1 });

// A user's comment history.
commentSchema.index({ user: 1, createdAt: -1 });

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

commentSchema.pre("save", function () {
  this.likesCount = this.likes?.length ?? 0;
});

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;

