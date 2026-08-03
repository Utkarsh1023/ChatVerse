import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/verifyToken";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import {
  getConnectionsDashboard,
  getFollowersList,
  getFollowingList,
  followUser,
  unfollowUser,
  removeFollower,
} from "../services/connections.service";
import {
  getFriendsList as getFriendsListService,
  getFriendRequests as getFriendRequestsService,
  getSuggestions as getSuggestionsService,
  parsePagination,
} from "../services/friends.service";
import { Types } from "mongoose";

/** Resolve the authenticated user id from either convention used in this repo. */
const getUserId = (req: AuthRequest): string => {
  const id = req.user?.id || req.userId;
  if (!id) {
    throw new ApiError(401, "Unauthorized");
  }
  return id;
};

/** Validate a route param is a well-formed ObjectId BEFORE hitting the DB. */
const assertObjectId = (
  id: string | string[] | undefined,
  label: string
): string => {
  const value = Array.isArray(id) ? id[0] : id;
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
  return value;
};

/**
 * GET /api/connections/dashboard
 * Single-request payload with everything the Connections page needs:
 * stats, friends, followers, following, friend requests, suggestions,
 * online friends and recent activity.
 */
export const getDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const data = await getConnectionsDashboard(
      myId,
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );
    return res.status(200).json(data);
  }
);

/**
 * GET /api/connections/friends
 * Friends list only (paginated).
 */
export const getFriends = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const objectId = new Types.ObjectId(myId);
    const pagination = parsePagination(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );
    const data = await getFriendsListService(objectId, pagination);
    return res.status(200).json({ success: true, ...data });
  }
);

/**
 * GET /api/connections/followers
 * Followers list only.
 */
export const getFollowers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const objectId = new Types.ObjectId(myId);
    const followers = await getFollowersList(objectId);
    return res.status(200).json({ success: true, followers });
  }
);

/**
 * GET /api/connections/following
 * Following list only.
 */
export const getFollowing = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const objectId = new Types.ObjectId(myId);
    const following = await getFollowingList(objectId);
    return res.status(200).json({ success: true, following });
  }
);

/**
 * GET /api/connections/friend-requests
 * Pending incoming friend requests only.
 */
export const getFriendRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const objectId = new Types.ObjectId(myId);
    const requests = await getFriendRequestsService(objectId);
    return res.status(200).json({ success: true, requests });
  }
);

/**
 * GET /api/connections/suggestions
 * Suggested users only.
 */
export const getSuggestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const objectId = new Types.ObjectId(myId);
    const suggestions = await getSuggestionsService(objectId);
    return res.status(200).json({ success: true, suggestions });
  }
);

/**
 * POST /api/connections/follow/:userId
 * Follow a user.
 */
export const follow = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const targetId = assertObjectId(req.params.userId, "user id");
    await followUser(myId, targetId);
    return res.status(200).json({
      success: true,
      message: "Following user",
    });
  }
);

/**
 * DELETE /api/connections/unfollow/:userId
 * Unfollow a user.
 */
export const unfollow = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const targetId = assertObjectId(req.params.userId, "user id");
    await unfollowUser(myId, targetId);
    return res.status(200).json({
      success: true,
      message: "Unfollowed user",
    });
  }
);

/**
 * DELETE /api/connections/followers/:userId
 * Remove a follower.
 */
export const removeFollowerController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const followerId = assertObjectId(req.params.userId, "user id");
    await removeFollower(myId, followerId);
    return res.status(200).json({
      success: true,
      message: "Follower removed",
    });
  }
);

