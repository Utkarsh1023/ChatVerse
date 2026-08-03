import mongoose, { Types } from "mongoose";
import User from "../models/User";
import FriendRequest from "../models/FriendRequest";
import Notification from "../models/Notification";
import ApiError from "../utils/ApiError";
import {
  DashboardResponse,
  DashboardStats,
  FriendCard,
  FriendRequestCard,
  OnlineFriend,
  PaginationOptions,
  RecentActivity,
  SuggestionCard,
} from "../utils/dashboardTypes";
import { getIO } from "../socket/socket";

/**
 * Friends Dashboard service layer.
 *
 * Orchestrates the single `GET /api/friends/dashboard` payload so the
 * frontend renders the whole Friends page from ONE request. All queries are
 * deliberately bounded with `.select()`, `.lean()` and aggregation — no N+1,
 * no fetching every user.
 */

/** Safe fields for recent-activity actor. */
const ACTIVITY_ACTOR_SELECT = "name username avatar";

/** Parse + clamp the pagination query params. */
export const parsePagination = (
  pageRaw?: string | string[],
  limitRaw?: string | string[]
): PaginationOptions => {
  const page = Math.max(1, parseInt(String(pageRaw ?? "1"), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(String(limitRaw ?? "20"), 10) || 20)
  );
  return { page, limit, skip: (page - 1) * limit };
};

/** Convert a value to a string safely (never throws). */
export const str = (v: unknown): string => (v == null ? "" : String(v));

/** Convert a Date-ish value to ISO string or null. */
export const toISO = (v: unknown): string | null =>
  v instanceof Date ? v.toISOString() : v ? String(v) : null;

/**
* Compute the aggregate stats in a SINGLE aggregation pipeline over the
 * caller's user document. Returns real counts from the DB — never hardcoded.
 */
export const getStats = async (
  userId: Types.ObjectId
): Promise<DashboardStats> => {
  const me = await User.findById(userId).select("friends").lean();
  const friendIds = (me?.friends ?? []) as Types.ObjectId[];

  const [stats, onlineCount] = await Promise.all([
    User.aggregate<DashboardStats>([
      { $match: { _id: userId } },
      {
        $project: {
          _id: 0,
          friends: { $size: { $ifNull: ["$friends", []] } },
          followers: { $size: { $ifNull: ["$followers", []] } },
          following: { $size: { $ifNull: ["$following", []] } },
          requests: { $size: { $ifNull: ["$friendRequests", []] } },
        },
      },
    ]),
    // Online friends = friends of the caller who are currently online.
    User.countDocuments({
      _id: { $in: friendIds },
      isOnline: true,
    }),
  ]);

  const statsRow = stats[0];
  return {
    friends: statsRow?.friends ?? 0,
    followers: statsRow?.followers ?? 0,
    following: statsRow?.following ?? 0,
    requests: statsRow?.requests ?? 0,
    online: onlineCount,
  };
};

/**
* Fetch the logged-in user's friends with pagination, sorted by
 *  1. online first
 *  2. recently active (lastSeen desc)
 *  3. alphabetical (name asc)
 * Each friend includes live follower/following/mutual-friend counts via
 * aggregation joins — computed in a single query (no N+1).
 */
export const getFriendsList = async (
  userId: Types.ObjectId,
  pagination: PaginationOptions
): Promise<{ friends: FriendCard[]; total: number }> => {
  const me = await User.findById(userId).select("friends").lean();

  if (!me) {
    throw new ApiError(404, "User not found");
  }

  const friendIds = (me.friends ?? []) as Types.ObjectId[];
  // Mutual friends = users who are in BOTH my friends list AND the candidate's
  // friends list. Both are arrays, so `$in` receives valid array operands.
  const myFriendIds = friendIds;

  const [total, docs] = await Promise.all([
    User.countDocuments({ _id: { $in: friendIds } }),
    User.aggregate([
      { $match: { _id: { $in: friendIds } } },
      {
        $lookup: {
          from: "users",
          let: { candidateFriends: "$friends" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", myFriendIds] },
                    { $in: ["$_id", "$$candidateFriends"] },
                  ],
                },
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "mutual",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          username: 1,
          avatar: 1,
          coverImage: 1,
          bio: 1,
          country: 1,
          profession: 1,
          isOnline: 1,
          lastSeen: 1,
          createdAt: 1,
          followers: { $size: { $ifNull: ["$followers", []] } },
          following: { $size: { $ifNull: ["$following", []] } },
          mutualFriends: { $size: "$mutual" },
        },
      },
      {
        $sort: {
          isOnline: -1,
          lastSeen: -1,
          name: 1,
        },
      },
      { $skip: pagination.skip },
      { $limit: pagination.limit },
    ]),
  ]);

  const friends: FriendCard[] = docs.map((d) => ({
    _id: str(d._id),
    name: str(d.name),
    username: str(d.username),
    avatar: d.avatar ? str(d.avatar) : undefined,
    coverImage: d.coverImage ? str(d.coverImage) : undefined,
    bio: d.bio ? str(d.bio) : undefined,
    country: d.country ? str(d.country) : undefined,
    profession: d.profession ? str(d.profession) : undefined,
    isOnline: Boolean(d.isOnline),
    lastSeen: toISO(d.lastSeen),
    followers: d.followers ?? 0,
    following: d.following ?? 0,
    mutualFriends: d.mutualFriends ?? 0,
    createdAt: toISO(d.createdAt) ?? "",
    relationship: "friend",
  }));

  return { friends, total };
};

/**
 * Pending incoming friend requests, each with sender avatar/profession,
 * mutual-friend count and the request's receivedAt timestamp.
 */
export const getFriendRequests = async (
  userId: Types.ObjectId
): Promise<FriendRequestCard[]> => {
  const me = await User.findById(userId).select("friends").lean();
  const myFriendIds = (me?.friends ?? []) as Types.ObjectId[];

  const requests = await FriendRequest.aggregate([
    { $match: { receiver: userId, status: "pending" } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "senderDoc",
      },
    },
    { $unwind: { path: "$senderDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        let: { senderFriends: "$senderDoc.friends" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$_id", myFriendIds] },
                  { $in: ["$_id", "$$senderFriends"] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "mutual",
      },
    },
    {
      $project: {
        _id: 1,
        createdAt: 1,
        sender: {
          _id: "$senderDoc._id",
          name: "$senderDoc.name",
          username: "$senderDoc.username",
          avatar: "$senderDoc.avatar",
          profession: "$senderDoc.profession",
          isOnline: "$senderDoc.isOnline",
          lastSeen: "$senderDoc.lastSeen",
        },
        mutualFriends: { $size: "$mutual" },
      },
    },
  ]);

  return requests.map((r) => ({
    _id: str(r._id),
    sender: {
      _id: str(r.sender?._id),
      name: str(r.sender?.name),
      username: str(r.sender?.username),
      avatar: r.sender?.avatar ? str(r.sender.avatar) : undefined,
      profession: r.sender?.profession ? str(r.sender.profession) : undefined,
      isOnline: Boolean(r.sender?.isOnline),
      lastSeen: toISO(r.sender?.lastSeen),
    },
    mutualFriends: r.mutualFriends ?? 0,
    receivedAt: toISO(r.createdAt) ?? "",
  }));
};

/**
* Suggestions — users who are NOT the caller, NOT already friends, and have
 * NO pending request in either direction. Sorted by most mutual friends, then
 * most followers, then recently active. Limited to 10.
 */
export const getSuggestions = async (
  userId: Types.ObjectId
): Promise<SuggestionCard[]> => {
  const me = await User.findById(userId)
    .select("friends friendRequests sentRequests")
    .lean();

  if (!me) {
    throw new ApiError(404, "User not found");
  }

  const excludeIds = new Set<string>([
    ...(me.friends ?? []).map((id) => String(id)),
    ...(me.friendRequests ?? []).map((id) => String(id)),
    ...(me.sentRequests ?? []).map((id) => String(id)),
  ]);
  excludeIds.add(String(userId));

  const exclude = [...excludeIds].map((id) => new Types.ObjectId(id));

  const suggestions = await User.aggregate([
    { $match: { _id: { $nin: exclude } } },
    {
      $lookup: {
        from: "users",
        let: { candidateFriends: "$friends" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$_id", me.friends as unknown[]] },
                  { $in: ["$_id", "$$candidateFriends"] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "mutual",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        username: 1,
        avatar: 1,
        profession: 1,
        isOnline: 1,
        lastSeen: 1,
        followers: { $size: { $ifNull: ["$followers", []] } },
        mutualFriends: { $size: "$mutual" },
      },
    },
    {
      $sort: {
        mutualFriends: -1,
        followers: -1,
        lastSeen: -1,
      },
    },
    { $limit: 10 },
  ]);

  return suggestions.map((s) => ({
    _id: str(s._id),
    name: str(s.name),
    username: str(s.username),
    avatar: s.avatar ? str(s.avatar) : undefined,
    profession: s.profession ? str(s.profession) : undefined,
    isOnline: Boolean(s.isOnline),
    lastSeen: toISO(s.lastSeen),
    followers: s.followers ?? 0,
    mutualFriends: s.mutualFriends ?? 0,
    relationship: "none" as const,
  }));
};

/**
* Online friends (subset of the friends list who are currently online),
 * sorted by most recently active (lastSeen desc).
 */
export const getOnlineFriends = async (
  userId: Types.ObjectId
): Promise<OnlineFriend[]> => {
  const me = await User.findById(userId).select("friends").lean();
  if (!me) {
    throw new ApiError(404, "User not found");
  }

  const friendIds = (me.friends ?? []) as Types.ObjectId[];

  const docs = await User.find({
    _id: { $in: friendIds },
    isOnline: true,
  })
    .select("name username avatar profession lastSeen")
    .sort({ lastSeen: -1 })
    .limit(20)
    .lean();

  return docs.map((d) => ({
    _id: String(d._id),
    name: d.name,
    username: d.username,
    avatar: d.avatar ? String(d.avatar) : undefined,
    profession: d.profession ? String(d.profession) : undefined,
    lastSeen: toISO(d.lastSeen),
  }));
};

/**
* Latest activity feed (20 items) — driven by the Notification collection.
 */
export const getRecentActivity = async (
  userId: Types.ObjectId
): Promise<RecentActivity[]> => {
  const docs = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("actor", ACTIVITY_ACTOR_SELECT)
    .lean();

  return docs.map((n) => {
    // `.lean()` keeps the populated `actor` loosely typed — narrow it safely.
    const actor = n.actor as unknown as {
      _id?: unknown;
      name?: unknown;
      username?: unknown;
      avatar?: unknown;
    } | null;

    return {
      _id: str(n._id),
      type: str(n.type),
      message: str(n.message),
      read: Boolean(n.read),
      createdAt: toISO(n.createdAt) ?? "",
      user: actor
        ? {
            _id: str(actor._id),
            name: str(actor.name),
            username: str(actor.username),
            avatar: actor.avatar ? str(actor.avatar) : undefined,
          }
        : null,
    };
  });
};

/**
 * Build and return the complete dashboard payload.
 */
export const getFriendsDashboard = async (
  userId: string,
  pagination: PaginationOptions
): Promise<DashboardResponse> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(401, "Authentication failed");
  }

  const objectId = new Types.ObjectId(userId);

  const [stats, onlineFriends, friendRequests, suggestions, recentActivity, friendsData] =
    await Promise.all([
      getStats(objectId),
      getOnlineFriends(objectId),
      getFriendRequests(objectId),
      getSuggestions(objectId),
      getRecentActivity(objectId),
      getFriendsList(objectId, pagination),
    ]);

  const totalPages = Math.max(1, Math.ceil(friendsData.total / pagination.limit));

  return {
    success: true,
    stats,
    onlineFriends,
    friendRequests,
    suggestions,
    recentActivity,
    friends: friendsData.friends,
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
 * Remove a friendship (both directions) + create a "friend removed" activity
 * for the removed peer. Emits a `friendRemoved` socket event.
 */
export const removeFriend = async (
  userId: string,
  friendId: string
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    throw new ApiError(404, "Not found");
  }
  if (userId === friendId) {
    throw new ApiError(400, "You cannot remove yourself");
  }

  const me = await User.findById(userId).select("friends name");
  const friend = await User.findById(friendId).select("friends name");

  if (!me || !friend) {
    throw new ApiError(404, "User not found");
  }

  if (!me.friends.some((id) => id.equals(friend._id))) {
    throw new ApiError(404, "You are not friends with this user");
  }

  me.friends = me.friends.filter((id) => !id.equals(friend._id));
  friend.friends = friend.friends.filter((id) => !id.equals(me._id));

  await Promise.all([me.save(), friend.save()]);

  await Notification.create({
    user: friend._id,
    actor: me._id,
    type: "friend_removed",
    message: `${me.name} removed you as a friend`,
  });

  const io = getIO();
  if (io) {
    io.to(`user:${friend._id}`).emit("friendRemoved", {
      removedBy: String(me._id),
      userId: String(friend._id),
    });
  }
};

/**
 * Create an activity/notification entry. Used by the friend request flow.
 */
export const createNotification = async (
  userId: string,
  actor: string,
  type: "friend_request_received" | "friend_request_accepted" | "new_follower" | "friend_removed" | "friend_accepted",
  message: string
): Promise<void> => {
  await Notification.create({
    user: userId,
    actor,
    type,
    message,
  });
};
