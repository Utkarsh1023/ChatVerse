import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { AuthRequest } from "../middleware/verifyToken";
import User from "../models/User";

import {
  getMyProfileService,
  updateProfileService,
  updateAvatarService,
  updateCoverService,
  deleteAvatarService,
  deleteCoverService,
  getProfileStatsService,
  getProfileStatsByUsernameService,
  getProfilePostsService,
  getProfileFriendsService,
  getProfileFollowersService,
  getProfileFollowingService,
} from "../services/profile.service";

/** Resolve the authenticated user id from either convention used in this repo. */
const getUserId = (req: AuthRequest): string => {
  const id = req.user?.id || req.userId;
  if (!id) {
    throw new ApiError(401, "Unauthorized");
  }
  return id;
};

/**
 * GET /api/profile/me
 * Return the authenticated user's complete profile (friends/followers/following
 * populated, password excluded).
 */
export const getMyProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = getUserId(req);

    const user = await getMyProfileService(userId);

    res
      .status(200)
      .json(new ApiResponse(200, "Profile fetched successfully", { user }));
  }
);

/**
 * PUT /api/profile
 * Update fullName, username, bio, country (validated by express-validator).
 */
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = getUserId(req);

    const { fullName, username, bio, country } = req.body ?? {};

    const user = await updateProfileService(userId, {
      fullName,
      username,
      bio,
      country,
    });

    res
      .status(200)
      .json(new ApiResponse(200, "Profile updated successfully", { user }));
  }
);

/**
 * PUT /api/profile/avatar
 * Upload a new avatar via multer → Cloudinary, delete the old one.
 */
export const uploadAvatar = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = getUserId(req);

    const user = await updateAvatarService(userId, req.file);

    res
      .status(200)
      .json(new ApiResponse(200, "Avatar updated successfully", { user }));
  }
);

/**
 * PUT /api/profile/cover
 * Upload a new cover via multer → Cloudinary, delete the old one.
 */
export const uploadCover = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = getUserId(req);

    const user = await updateCoverService(userId, req.file);

    res.status(200).json(
      new ApiResponse(200, "Cover image updated successfully", {
        coverImage: user.coverImage ?? "",
        user,
      })
    );
  }
);

/**
 * DELETE /api/profile/avatar
 * Remove the avatar from Cloudinary and reset to the default placeholder.
 */
export const deleteAvatar = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = getUserId(req);

    const user = await deleteAvatarService(userId);

    res
      .status(200)
      .json(new ApiResponse(200, "Avatar removed successfully", { user }));
  }
);

/**
 * DELETE /api/profile/cover
 * Remove the cover from Cloudinary and reset to empty.
 */
export const deleteCover = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = getUserId(req);

    const user = await deleteCoverService(userId);

    res
      .status(200)
      .json(new ApiResponse(200, "Cover removed successfully", { user }));
  }
);

/**
 * GET /api/profile/stats
 * Return real MongoDB counts for friends, followers, following and posts.
 */
export const getProfileStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = getUserId(req);

    const stats = await getProfileStatsService(userId);

    res
      .status(200)
      .json(new ApiResponse(200, "Profile stats fetched successfully", { stats }));
  }
);

export const getProfileByUsername = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const usernameParam = req.params.username;
    const username = Array.isArray(usernameParam) ? usernameParam[0] : usernameParam;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username parameter is required",
      });
    }

    // 🐞 TRACE: confirm we are using the URL username — NOT req.user.id.
    console.log(
      `[profile.controller] getProfileByUsername called with req.params.username = "${username}"`
    );

    const user = await User.findOne({ username })
      .select("-password")
      .populate("friends")
      .populate("followers")
      .populate("following")
      .populate("posts");

    // 🐞 TRACE: confirm the MongoDB query result for this username.
    console.log(
      `[profile.controller] findOne({ username: "${username}" }) => ${
        user ? `FOUND user ${user.username}` : "null (not found)"
      }`
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * GET /api/profile/:username/stats
 * Return real MongoDB counts for ANOTHER user's profile — resolves the target
 * from req.params.username (never req.user.id), so viewing a friend's profile
 * shows THEIR stats, not the logged-in user's.
 */
export const getProfileStatsByUsername = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const usernameParam = req.params.username;
    const username = Array.isArray(usernameParam) ? usernameParam[0] : usernameParam;

    if (!username) {
      throw new ApiError(400, "Username parameter is required");
    }

    // 🐞 TRACE: confirm we are using the URL username — NOT req.user.id.
    console.log(
      `[profile.controller] getProfileStatsByUsername called with req.params.username = "${username}"`
    );

    const stats = await getProfileStatsByUsernameService(username);

    res
      .status(200)
      .json(new ApiResponse(200, "Profile stats fetched successfully", { stats }));
  }
);

/** Extract the username param from the URL (works for string or array). */
const getUsernameParam = (req: Request): string => {
  const usernameParam = req.params.username;
  return Array.isArray(usernameParam) ? usernameParam[0] : usernameParam;
};

/**
 * GET /api/profile/posts/:username
 * All posts by a user, resolved by USERNAME (the frontend passes the URL
 * username from useParams()). Returns a consistent ApiResponse envelope.
 */
export const getProfilePosts = asyncHandler(
  async (req: Request, res: Response) => {
    const username = getUsernameParam(req);

    console.log("Username:", username);

    const posts = await getProfilePostsService(username);

    console.log("Posts:", posts);

    res.status(200).json(
      new ApiResponse(200, "Posts fetched successfully", {
        posts,
      })
    );
  }
);

/**
 * GET /api/profile/friends/:username
 * Populated friends list for the profile owner, resolved by username.
 */
export const getFriends = asyncHandler(
  async (req: Request, res: Response) => {
    const username = getUsernameParam(req);

    console.log(
      `[profile.controller] getFriends called with req.params.username = "${username}"`
    );

    const friends = await getProfileFriendsService(username);

    res
      .status(200)
      .json(new ApiResponse(200, "Friends fetched successfully", { friends }));
  }
);

/**
 * GET /api/profile/followers/:username
 * Populated followers list for the profile owner, resolved by username.
 */
export const getFollowers = asyncHandler(
  async (req: Request, res: Response) => {
    const username = getUsernameParam(req);

    console.log(
      `[profile.controller] getFollowers called with req.params.username = "${username}"`
    );

    const followers = await getProfileFollowersService(username);

    res
      .status(200)
      .json(
        new ApiResponse(200, "Followers fetched successfully", { followers })
      );
  }
);

/**
 * GET /api/profile/following/:username
 * Populated following list for the profile owner, resolved by username.
 */
export const getFollowing = asyncHandler(
  async (req: Request, res: Response) => {
    const username = getUsernameParam(req);

    console.log(
      `[profile.controller] getFollowing called with req.params.username = "${username}"`
    );

    const following = await getProfileFollowingService(username);

    res
      .status(200)
      .json(
        new ApiResponse(200, "Following fetched successfully", { following })
      );
  }
);



