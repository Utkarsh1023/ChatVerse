import mongoose, { Types } from "mongoose";
import User from "../models/User";
import Follow from "../models/Follow";
import Notification from "../models/Notification";
import ApiError from "../utils/ApiError";
import {
  ConnectionsResponse,
  FollowerCard,
  FollowingCard,
  PaginationOptions,
} from "../utils/dashboardTypes";
import {
  getStats,
  getFriendsList,
  getFriendRequests,
  getSuggestions,
  getOnlineFriends,
  getRecentActivity,
  parsePagination,
  createNotification,
  str,
  toISO,
} from "./friends.service";
import { getIO } from "../socket/socket";

/** Safe fields for a follower/following card. */
const CARD_SELECT =
  "name username avatar bio profession isOnline isVerified lastSeen";

/**
 * Build the complete unified Connections dashboard payload in a single
 * request: stats, friends, followers, following, friend requests, suggestions,
 * online friends and recent activity.
 */
export const getConnectionsDashboard = async (
  userId: string,
  pageRaw?: string | string[],
  limitRaw?: string | string[]
): Promise<ConnectionsResponse> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(401, "Authentication failed");
  }

  const objectId = new Types.ObjectId(userId);
  const pagination = parsePagination(pageRaw, limitRaw);

  const [
    stats,
    onlineFriends,
    friendRequests,
    suggestions,
    recentActivity,
    friendsData,
    followers,
    following,
  ] = await Promise.all([
    getStats(objectId),
    getOnlineFriends(objectId),
    getFriendRequests(objectId),
    getSuggestions(objectId),
    getRecentActivity(objectId),
    getFriendsList(objectId, pagination),
    getFollowersList(objectId),
    getFollowingList(objectId),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(friendsData.total / pagination.limit)
  );

  return {
    success: true,
    stats,
    friends: friendsData.friends,
    followers,
    following,
    friendRequests,
    suggestions,
    onlineFriends,
    recentActivity,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: friendsData.total,
      totalPages,
      hasMore: pagination.page * pagination.limit < friendsData.total,
    },
  };
};

/**
 * GET /api/connections/followers
 * All users following the caller, with the follow date and whether the caller
 * follows them back. Sorted by most recent first.
 */
export const getFollowersList = async (
  userId: Types.ObjectId
): Promise<FollowerCard[]> => {
  const me = await User.findById(userId)
    .select("friends following")
    .lean();
  if (!me) {
    throw new ApiError(404, "User not found");
  }

  const myFriendIds = new Set((me.friends ?? []).map((id) => String(id)));
  const myFollowingIds = new Set((me.following ?? []).map((id) => String(id)));

  const docs = await Follow.aggregate([
    { $match: { following: userId } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "follower",
        foreignField: "_id",
        as: "followerDoc",
      },
    },
    { $unwind: { path: "$followerDoc", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        followedAt: "$createdAt",
        follower: {
          _id: "$followerDoc._id",
          name: "$followerDoc.name",
          username: "$followerDoc.username",
          avatar: "$followerDoc.avatar",
          bio: "$followerDoc.bio",
          profession: "$followerDoc.profession",
          isOnline: "$followerDoc.isOnline",
          isVerified: "$followerDoc.isVerified",
          lastSeen: "$followerDoc.lastSeen",
        },
      },
    },
  ]);

  return docs
    .filter((d) => d.follower?._id)
    .map((d) => {
      const id = str(d.follower._id);
      return {
        _id: id,
        name: str(d.follower.name),
        username: str(d.follower.username),
        avatar: d.follower.avatar ? str(d.follower.avatar) : undefined,
        bio: d.follower.bio ? str(d.follower.bio) : undefined,
        profession: d.follower.profession
          ? str(d.follower.profession)
          : undefined,
        isOnline: Boolean(d.follower.isOnline),
        isVerified: Boolean(d.follower.isVerified),
        lastSeen: toISO(d.follower.lastSeen),
        followedAt: toISO(d.followedAt) ?? "",
        isFollowingBack: myFollowingIds.has(id),
        isFriend: myFriendIds.has(id),
      };
    });
};

/**
 * GET /api/connections/following
 * All users the caller follows, with the following-since date and whether
 * they are already friends. Sorted by most recent first.
 */
export const getFollowingList = async (
  userId: Types.ObjectId
): Promise<FollowingCard[]> => {
  const me = await User.findById(userId).select("friends").lean();
  if (!me) {
    throw new ApiError(404, "User not found");
  }

  const myFriendIds = new Set((me.friends ?? []).map((id) => String(id)));

  const docs = await Follow.aggregate([
    { $match: { follower: userId } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "following",
        foreignField: "_id",
        as: "followingDoc",
      },
    },
    { $unwind: { path: "$followingDoc", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        followingSince: "$createdAt",
        target: {
          _id: "$followingDoc._id",
          name: "$followingDoc.name",
          username: "$followingDoc.username",
          avatar: "$followingDoc.avatar",
          bio: "$followingDoc.bio",
          profession: "$followingDoc.profession",
          isOnline: "$followingDoc.isOnline",
          isVerified: "$followingDoc.isVerified",
          lastSeen: "$followingDoc.lastSeen",
        },
      },
    },
  ]);

  return docs
    .filter((d) => d.target?._id)
    .map((d) => {
      const id = str(d.target._id);
      return {
        _id: id,
        name: str(d.target.name),
        username: str(d.target.username),
        avatar: d.target.avatar ? str(d.target.avatar) : undefined,
        bio: d.target.bio ? str(d.target.bio) : undefined,
        profession: d.target.profession
          ? str(d.target.profession)
          : undefined,
        isOnline: Boolean(d.target.isOnline),
        isVerified: Boolean(d.target.isVerified),
        lastSeen: toISO(d.target.lastSeen),
        followingSince: toISO(d.followingSince) ?? "",
        isFriend: myFriendIds.has(id),
      };
    });
};

/**
 * POST /api/connections/follow/:userId
 * Follow a user: appends to both `followers` / `following` arrays (idempotent)
 * and upserts a Follow document so the follow date is tracked. Notifies the
 * target via a `newFollower` notification + `newFollower` socket event.
 */
export const followUser = async (
  userId: string,
  targetId: string
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new ApiError(400, "Invalid user id");
  }
  if (userId === targetId) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const me = await User.findById(userId).select("name following");
  const target = await User.findById(targetId).select("name followers");

  if (!me || !target) {
    throw new ApiError(404, "User not found");
  }

  const targetObjectId = target._id;
  const meObjectId = me._id;

  // Already following → no-op.
  if (me.following.some((id) => id.equals(targetObjectId))) {
    return;
  }

  me.following.push(targetObjectId);
  target.followers.push(meObjectId);
  await Promise.all([me.save(), target.save()]);

  // Upsert the Follow doc (captures the follow date).
  await Follow.updateOne(
    { follower: meObjectId, following: targetObjectId },
    { $setOnInsert: { follower: meObjectId, following: targetObjectId } },
    { upsert: true }
  );

  // 🔔 Notification + socket event for the target.
  await createNotification(
    String(target._id),
    String(me._id),
    "new_follower",
    `${me.name} started following you`
  );

  const io = getIO();
  if (io) {
    const meSafe = await User.findById(me._id).select(
      "name username avatar profession isOnline isVerified"
    );
    io.to(`user:${target._id}`).emit("newFollower", {
      follower: meSafe,
      count: target.followers.length,
    });
  }
};

/**
 * DELETE /api/connections/unfollow/:userId
 * Unfollow a user: removes from both `following` / `followers` arrays and
 * deletes the Follow document. Emits an `unfollowed` socket event to the
 * target so their followers list updates in real time.
 */
export const unfollowUser = async (
  userId: string,
  targetId: string
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new ApiError(400, "Invalid user id");
  }
  if (userId === targetId) {
    throw new ApiError(400, "You cannot unfollow yourself");
  }

  const me = await User.findById(userId).select("following name");
  const target = await User.findById(targetId).select("followers");

  if (!me || !target) {
    throw new ApiError(404, "User not found");
  }

  const targetObjectId = target._id;
  const meObjectId = me._id;

  me.following = me.following.filter((id) => !id.equals(targetObjectId));
  target.followers = target.followers.filter((id) => !id.equals(meObjectId));

  await Promise.all([me.save(), target.save()]);

  await Follow.deleteOne({
    follower: meObjectId,
    following: targetObjectId,
  });

  const io = getIO();
  if (io) {
    io.to(`user:${target._id}`).emit("unfollowed", {
      userId: String(me._id),
    });
    io.to(`user:${String(me._id)}`).emit("followingUpdated", {});
  }
};

/**
 * DELETE /api/connections/followers/:userId
 * Remove a follower: removes from the caller's `followers` and the target's
 * `following` arrays, plus the Follow doc. Emits a `followerRemoved` socket
 * event to the removed follower.
 */
export const removeFollower = async (
  userId: string,
  followerId: string
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(followerId)) {
    throw new ApiError(400, "Invalid user id");
  }
  if (userId === followerId) {
    throw new ApiError(400, "You cannot remove yourself");
  }

  const me = await User.findById(userId).select("followers");
  const follower = await User.findById(followerId).select("following");

  if (!me || !follower) {
    throw new ApiError(404, "User not found");
  }

  const followerObjectId = follower._id;
  const meObjectId = me._id;

  if (!me.followers.some((id) => id.equals(followerObjectId))) {
    throw new ApiError(404, "This user is not following you");
  }

  me.followers = me.followers.filter((id) => !id.equals(followerObjectId));
  follower.following = follower.following.filter((id) => !id.equals(meObjectId));

  await Promise.all([me.save(), follower.save()]);

  await Follow.deleteOne({
    follower: followerObjectId,
    following: meObjectId,
  });

  const io = getIO();
  if (io) {
    io.to(`user:${followerId}`).emit("followerRemoved", {
      removedBy: String(userId),
    });
    io.to(`user:${String(userId)}`).emit("followersUpdated", {});
  }
};

