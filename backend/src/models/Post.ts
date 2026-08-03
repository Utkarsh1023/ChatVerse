import mongoose, { Schema, Document, Types } from "mongoose";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum PostPrivacy {
  PUBLIC = "public",
  FOLLOWERS = "followers",
  PRIVATE = "private",
}

// Matches Cloudinary `resource_type` (image | video | raw | auto).
export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  RAW = "raw",
  AUDIO = "audio",
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/**
 * A single media item hosted on Cloudinary.
 * `public_id` is required so assets can be deleted/updated later.
 */
export interface IMedia {
  url: string;           // secure_url
  public_id: string;     // Cloudinary public_id (used for destroy/update)
  type: MediaType;       // image | video | raw | audio
  format?: string;       // jpg, png, mp4, ...
  width?: number;
  height?: number;
  duration?: number;     // seconds (video/audio)
  size?: number;         // bytes
  thumbnailUrl?: string; // auto-generated poster for videos
}

export interface IPost extends Document {
  author: Types.ObjectId;
  caption: string;
  media: IMedia[];
  tags: string[];
  location?: string;
  privacy: PostPrivacy;
  likes: Types.ObjectId[];
  likesCount: number;
  comments: Types.ObjectId[];
  commentsCount: number;
  sharesCount: number;
  savedBy: Types.ObjectId[];
  savedCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Media subdocument schema
//
// IMPORTANT: this is a SEPARATE schema, NOT an inline object literal.
// An inline literal like `media: { url: String, type: String }` makes
// Mongoose interpret `type` as the path's schema-type discriminator — the
// whole object silently becomes a String path and casting fails with
// "Cast to string failed ... at path media". Declaring it as its own schema
// keeps `type` as a normal field name.
// ---------------------------------------------------------------------------

const mediaSchema = new Schema<IMedia>(
  {
    url: {
      type: String,
      required: [true, "Media URL is required"],
      trim: true,
    },
    public_id: {
      type: String,
      required: [true, "Cloudinary public_id is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(MediaType),
      required: [true, "Media type is required"],
    },
    format: { type: String, default: "" },
    width: { type: Number, default: 0, min: 0 },
    height: { type: Number, default: 0, min: 0 },
    duration: { type: Number, default: 0, min: 0 },
    size: { type: Number, default: 0, min: 0 },
    thumbnailUrl: { type: String, default: "" },
  },
  { _id: false } // no _id on each media item — keeps payloads small
);

// ---------------------------------------------------------------------------
// Post schema
// ---------------------------------------------------------------------------

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },

    caption: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2200, "Caption cannot exceed 2200 characters"],
    },

    // Array => carousel-ready. A single-image post is just `media: [item]`.
    media: {
      type: [mediaSchema],
      required: [true, "Post must contain at least one media item"],
      validate: {
        validator: (value: IMedia[]) =>
          Array.isArray(value) && value.length > 0,
        message: "Post must contain at least one media item",
      },
    },

    tags: {
      type: [String],
      default: [],
      set: (tags: unknown) =>
        Array.isArray(tags)
          ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
          : [],
    },

    location: { type: String, default: "", trim: true },

    privacy: {
      type: String,
      enum: Object.values(PostPrivacy),
      default: PostPrivacy.PUBLIC,
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: { type: Number, default: 0, min: 0 },

    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    commentsCount: { type: Number, default: 0, min: 0 },

    sharesCount: { type: Number, default: 0, min: 0 },

    savedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    savedCount: { type: Number, default: 0, min: 0 },

    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes (feed performance)
// ---------------------------------------------------------------------------

// Global feed: latest public posts.
postSchema.index({ privacy: 1, createdAt: -1 });

// Profile feed: all posts by one author, newest first.
postSchema.index({ author: 1, createdAt: -1 });

// Tag exploration / search.
postSchema.index({ tags: 1, createdAt: -1 });

// "Explore" feed: top-liked posts.
postSchema.index({ likesCount: -1, createdAt: -1 });

// Saved posts: a user's bookmarks, newest first.
postSchema.index({ savedBy: 1, createdAt: -1 });

// ---------------------------------------------------------------------------
// Hooks — keep denormalized counters in sync on document save
// ---------------------------------------------------------------------------

postSchema.pre("save", function () {
  this.likesCount = this.likes?.length ?? 0;
  this.commentsCount = this.comments?.length ?? 0;
  this.savedCount = this.savedBy?.length ?? 0;
});

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;

