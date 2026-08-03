import mongoose from "mongoose";
import fs from "fs";
import User, { IUser } from "../models/User";
import Post from "../models/Post";
import ApiError from "../utils/ApiError";
import {
  uploadAvatarImage,
  uploadCoverImage,
  deleteImageFromUrl,
  CloudinaryUploadResult,
} from "./cloudinary.service";
import { notifyProfileUpdated } from "../socket/socket";

/** Fields always excluded from user responses. */
const PRIVATE_FIELDS = "-password -refreshToken";

/** Populate spec for the profile's social graphs. */
const SOCIAL_POPULATE: { path: string; select: string }[] = [
  { path: "friends", select: "name username avatar bio isOnline lastSeen isVerified" },
  { path: "followers", select: "name username avatar bio isOnline lastSeen isVerified" },
  { path: "following", select: "name username avatar bio isOnline lastSeen isVerified" },
];

/**
 * Best-effort removal of the multer temp file. Never throws — profile
 * updates must not fail because a temp file could not be cleaned up.
 */
const removeTempFile = (filePath?: string): void => {
  if (!filePath) return;
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn("⚠️ Could not delete temp file:", msg);
  }
};

/** Assert the authenticated user exists and return them. */
const findUserOrThrow = async (userId: string): Promise<IUser> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(401, "Authentication failed");
  }

  const user = await User.findById(userId).select(PRIVATE_FIELDS);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

/**
 * GET /api/profile/me
 * Return the authenticated user's complete profile with friends, followers
 * and following populated (password excluded).
 */
export const getMyProfileService = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId)
    .select(PRIVATE_FIELDS)
    .populate(SOCIAL_POPULATE);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export interface UpdateProfileInput {
  fullName?: string;
  username?: string;
  bio?: string;
  country?: string;
}

/**
 * PUT /api/profile
 * Update fullName, username, bio, country. Username must be unique
 * (excluding self), values are trimmed before persisting.
 */
export const updateProfileService = async (
  userId: string,
  input: UpdateProfileInput
): Promise<IUser> => {
  const user = await findUserOrThrow(userId);

  const { fullName, username, bio, country } = input;

  if (username !== undefined) {
    const normalized = username.trim().toLowerCase();

    // Ensure the new username is not already taken by another user.
    const existing = await User.findOne({
      username: normalized,
      _id: { $ne: user._id },
    });

    if (existing) {
      throw new ApiError(409, "Username is already taken");
    }

    user.username = normalized;
  }

  if (fullName !== undefined) user.name = fullName.trim();
  if (bio !== undefined) user.bio = bio.trim();
  if (country !== undefined) user.country = country.trim();

  await user.save();

  // Re-fetch with populated social graphs so the response shape is identical
  // to GET /api/profile/me.
  const updated = await User.findById(userId)
    .select(PRIVATE_FIELDS)
    .populate(SOCIAL_POPULATE);

if (!updated) {
    throw new ApiError(404, "User not found");
  }

  // 🔔 Real-time: notify friends that this user's profile changed.
  await notifyProfileUpdated(userId);

  return updated;
};

/**
 * PUT /api/profile/avatar (and /cover)
 * Upload a new image, delete the previous one from Cloudinary, then persist
 * the secure URL.
 */
const updateProfileImage = async (
  userId: string,
  file: Express.Multer.File | undefined,
  field: "avatar" | "coverImage"
): Promise<IUser> => {
  if (!file) {
    throw new ApiError(400, "No image file uploaded");
  }

  const user = await findUserOrThrow(userId);

  // Upload the new image FIRST so the user never loses their avatar if
  // Cloudinary is down. Delete the old one only after a successful upload.
  let uploaded: CloudinaryUploadResult;
  try {
    uploaded =
      field === "avatar"
        ? await uploadAvatarImage(file.path)
        : await uploadCoverImage(file.path);
  } catch (error) {
    removeTempFile(file.path);
    throw error;
  }

  // Old image URL captured BEFORE we overwrite the field.
  const previous = field === "avatar" ? user.avatar : user.coverImage;

  if (field === "avatar") {
    user.avatar = uploaded.secure_url;
  } else {
    user.coverImage = uploaded.secure_url;
  }

  await user.save();

  // Best-effort cleanup of the temp file.
  removeTempFile(file.path);

  // Best-effort deletion of the previous Cloudinary asset (never throws).
  await deleteImageFromUrl(previous);

  // 🔔 Real-time: notify friends that this user's avatar/cover changed.
  await notifyProfileUpdated(userId);

  return user;
};

export const updateAvatarService = async (
  userId: string,
  file: Express.Multer.File | undefined
): Promise<IUser> => updateProfileImage(userId, file, "avatar");

export const updateCoverService = async (
  userId: string,
  file: Express.Multer.File | undefined
): Promise<IUser> => updateProfileImage(userId, file, "coverImage");

/**
 * DELETE /api/profile/avatar (and /cover)
 * Remove the current image from Cloudinary and reset the field.
 */
const deleteProfileImage = async (
  userId: string,
  field: "avatar" | "coverImage"
): Promise<IUser> => {
  const user = await findUserOrThrow(userId);

  const current = field === "avatar" ? user.avatar : user.coverImage;

  if (field === "avatar") {
    // Reset to the default generated avatar rather than an empty string so
    // the UI always has something to render.
    user.avatar = "https://ui-avatars.com/api/?background=random";
  } else {
    user.coverImage = "";
  }

  await user.save();

  // Remove the old Cloudinary asset (safe no-op for the default placeholder).
  await deleteImageFromUrl(current);

  return user;
};

export const deleteAvatarService = async (
  userId: string
): Promise<IUser> => deleteProfileImage(userId, "avatar");

export const deleteCoverService = async (
  userId: string
): Promise<IUser> => deleteProfileImage(userId, "coverImage");

/**
 * GET /api/profile/stats
 * Real counts from MongoDB (array lengths + posts count) — never hardcoded.
 */
export const getProfileStatsService = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(401, "Authentication failed");
  }

  const [user, postsCount] = await Promise.all([
    User.findById(userId).select("friends followers following"),
    Post.countDocuments({ author: userId }),
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    friends: user.friends?.length ?? 0,
    followers: user.followers?.length ?? 0,
    following: user.following?.length ?? 0,
    posts: postsCount,
  };
};

/**
 * Resolve a user id by their USERNAME. Every profile "data" endpoint
 * (posts / friends / followers / following) maps the URL username — which is
 * what the frontend receives from useParams() — to a real MongoDB _id before
 * querying. Passing a raw username to `findById`/`find({ author: username })`
 * would throw a Mongoose CastError and break the whole tab.
 */
const resolveUserIdByUsername = async (username: string): Promise<string> => {
  if (!username || typeof username !== "string") {
    throw new ApiError(400, "Username parameter is required");
  }

  // 🐞 TRACE: confirm the username reaching the service layer.
  console.log(`[profile.service] resolveUserIdByUsername("${username}")`);

  const user = await User.findOne({ username }).select("_id");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user._id.toString();
};

const USER_SUMMARY_FIELDS =
  "name username avatar bio isOnline lastSeen isVerified";

/**
 * GET /api/profile/posts/:username
 * All posts authored by a user, newest first, author populated.
 */
export const getProfilePostsService = async (username: string) => {
  const userId = await resolveUserIdByUsername(username);

  const posts = await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .populate("author", "name username avatar");

  // 🐞 TRACE: confirm how many posts MongoDB returned for this author.
  console.log(
    `[profile.service] Post.find({ author: "${userId}" }) => ${posts.length} post(s)`
  );

  return posts;
};

/**
 * GET /api/profile/friends/:username
 * Populated friends list for the profile owner, sorted by name.
 */
export const getProfileFriendsService = async (username: string) => {
  const userId = await resolveUserIdByUsername(username);

  const user = await User.findById(userId)
    .populate({ path: "friends", select: USER_SUMMARY_FIELDS })
    .select("friends");

  const friends = user?.friends ?? [];

  console.log(
    `[profile.service] friends for "${username}" => ${friends.length} user(s)`
  );

  return friends;
};

/**
 * GET /api/profile/followers/:username
 * Populated followers list for the profile owner, sorted by name.
 */
export const getProfileFollowersService = async (username: string) => {
  const userId = await resolveUserIdByUsername(username);

  const user = await User.findById(userId)
    .populate({ path: "followers", select: USER_SUMMARY_FIELDS })
    .select("followers");

  const followers = user?.followers ?? [];

  console.log(
    `[profile.service] followers for "${username}" => ${followers.length} user(s)`
  );

  return followers;
};

/**
 * GET /api/profile/following/:username
 * Populated following list for the profile owner, sorted by name.
 */
export const getProfileFollowingService = async (username: string) => {
  const userId = await resolveUserIdByUsername(username);

  const user = await User.findById(userId)
    .populate({ path: "following", select: USER_SUMMARY_FIELDS })
    .select("following");

  const following = user?.following ?? [];

  console.log(
    `[profile.service] following for "${username}" => ${following.length} user(s)`
  );

  return following;
};

/**
 * GET /api/profile/:username/stats
 * Real counts for ANOTHER user, resolved by username — NOT by the
 * authenticated user's id. This is the fix that ensures a friend's profile
 * shows THEIR friends/followers/following/posts, never the caller's.
 */
export const getProfileStatsByUsernameService = async (username: string) => {
  // 🐞 TRACE: confirm the username reaching the service.
  console.log(
    `[profile.service] getProfileStatsByUsernameService called with username = "${username}"`
  );

  if (!username || typeof username !== "string") {
    throw new ApiError(400, "Username is required");
  }

  const [user, postsCount] = await Promise.all([
    User.findOne({ username }).select("friends followers following"),
    // Count posts authored by the user matched by username — not by req.user.id.
    User.findOne({ username })
      .select("_id")
      .then((u) => (u ? Post.countDocuments({ author: u._id }) : 0)),
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 🐞 TRACE: confirm the MongoDB query result for this username.
  console.log(
    `[profile.service] findOne({ username: "${username}" }) => ${
      user ? `FOUND ${user.username}` : "null (not found)"
    }`
  );

  return {
    friends: user.friends?.length ?? 0,
    followers: user.followers?.length ?? 0,
    following: user.following?.length ?? 0,
    posts: postsCount,
  };
};

