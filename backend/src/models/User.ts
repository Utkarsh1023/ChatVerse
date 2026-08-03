import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  country: string;
  profession?: string;
  location?: string;
  coverImage?: string;
  friends: Types.ObjectId[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  posts: Types.ObjectId[];
  friendRequests: Types.ObjectId[];
  sentRequests: Types.ObjectId[];
  refreshToken?: string;
  isOnline: boolean;
  isVerified?: boolean;
  lastSeen?: Date;
  socketId?: string;
  author: Types.ObjectId; // Reference to the User who created this user (for admin purposes)
  fullName: string; // virtual → mirrors `name`
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    avatar: {
      type: String,
      default:
        "https://ui-avatars.com/api/?background=random",
    },

    coverImage: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    profession: {
      type: String,
      default: "",
      trim: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    location: {
      type: String,
      default: "",
    },

    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: () => [],
      },
    ],

    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: () => [],
      },
    ],

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: () => [],
      },
    ],

    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
        default: () => [],
      },
    ],

    friendRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: () => [],
      },
    ],

    sentRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: () => [],
      },
    ],

    isOnline: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastSeen: Date,

    socketId: String,

    refreshToken: {
      type: String,
      default: "",
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        const safe = ret as Record<string, unknown>;
        delete safe.password;
        delete safe.refreshToken;
        return safe;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        const safe = ret as Record<string, unknown>;
        delete safe.password;
        delete safe.refreshToken;
        return safe;
      },
    },
  }
);

/**
 * `fullName` virtual — the React frontend (ProfileHeader, AccountSettings,
 * AuthContext) reads `user.fullName`. The DB column is `name`; this virtual
 * exposes it under the frontend's expected key without duplicating data.
 */
userSchema.virtual("fullName").get(function (this: IUser) {
  return this.name;
});

userSchema.virtual("fullName").set(function (this: IUser, value: string) {
  this.name = value;
});

// Hash password BEFORE saving (runs on create + save when password modified)
userSchema.pre("save", async function (this: IUser) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Performance indexes for the Friends Dashboard queries.
userSchema.index({ isOnline: 1, lastSeen: -1 });
userSchema.index({ friends: 1 });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

const User = mongoose.model<IUser>("User", userSchema);

export default User;

