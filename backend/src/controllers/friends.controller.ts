import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/verifyToken";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import User from "../models/User";
import FriendRequest from "../models/FriendRequest";
import {
  getFriendsDashboard,
  parsePagination,
  removeFriend,
} from "../services/friends.service";
import {
  createNotification,
  updateNotificationStatus,
} from "../services/notification.service";
import { getIO } from "../socket/socket";

/**
 * Friends Dashboard controllers.
 *
 * GET /api/friends/dashboard  → single request with everything the Friends
 *                               page needs (stats, online, requests,
 *                               suggestions, activity, friends + pagination).
 * POST /api/friends/accept/:id → accept a pending request (spec: POST).
 * POST /api/friends/reject/:id → reject a pending request (spec: POST).
 * DELETE /api/friends/:id      → remove a friendship.
 */

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
 * GET /api/friends/dashboard?page=1&limit=20
 * Returns the entire Friends page payload in ONE request.
 */
export const getDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);

    const pagination = parsePagination(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );

    const data = await getFriendsDashboard(myId, pagination);

    return res.status(200).json(data);
  }
);

/**
 * POST /api/friends/accept/:id
 * Accept a pending friend request. Keeps both the legacy array fields
 * (User.friendRequests/sentRequests) and the FriendRequest collection in sync.
 */
export const acceptRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const senderId = assertObjectId(req.params.id, "user id");

    const me = await User.findById(myId);
    const sender = await User.findById(senderId);

    if (!me || !sender) {
      throw new ApiError(404, "User not found");
    }

    // Verify against BOTH the legacy array and the FriendRequest collection
    // so a desynced array can't block a valid accept.
    const inArray = me.friendRequests.some((id) => id.equals(sender._id));
    const inCollection = await FriendRequest.exists({
      sender: sender._id,
      receiver: me._id,
      status: "pending",
    });

    if (!inArray && !inCollection) {
      throw new ApiError(404, "No pending friend request from this user");
    }

    // Update the legacy arrays.
    me.friendRequests = me.friendRequests.filter((id) => !id.equals(sender._id));
    sender.sentRequests = sender.sentRequests.filter((id) => !id.equals(me._id));

    if (!me.friends.some((id) => id.equals(sender._id))) {
      me.friends.push(sender._id);
    }
    if (!sender.friends.some((id) => id.equals(me._id))) {
      sender.friends.push(me._id);
    }

    await Promise.all([me.save(), sender.save()]);

    // Update the FriendRequest collection (single doc, index-backed).
    await FriendRequest.updateMany(
      {
        sender: sender._id,
        receiver: me._id,
        status: "pending",
      },
      { status: "accepted" }
    );

    // Activity + notification for the sender ("X accepted your request").
    await createNotification({
  recipient: sender._id,
  sender: me._id,
  type: "friend_accept",
});

    // 🔔 Mark the pending friend-request notification as "accepted" and push
    // the updated notification to the receiver's UI in real time.
    await updateNotificationStatus(myId, senderId, "accepted");

    const io = getIO();
    if (io) {
      const meSafe = await User.findById(myId).select(
        "name username avatar bio isOnline lastSeen"
      );
      io.to(`user:${senderId}`).emit("friendRequestAccepted", { friend: meSafe });
      io.to(`user:${senderId}`).emit("friendAccepted", {
        friend: meSafe,
        by: String(me._id),
      });
      io.to(`user:${senderId}`).emit("friend:accepted", {
        friend: meSafe,
        by: String(me._id),
      });
      io.to(`user:${myId}`).emit("friend:accepted", {
        friend: meSafeFor(me),
        by: String(me._id),
      });
      io.to(`user:${myId}`).emit("friendsUpdated", {});
    }

    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
      friend: meSafeFor(me),
    });
  }
);

/**
 * POST /api/friends/reject/:id
 * Reject a pending friend request (no friendship created).
 */
export const rejectRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const senderId = assertObjectId(req.params.id, "user id");

    const me = await User.findById(myId);
    const sender = await User.findById(senderId);

if (!me || !sender) {
      throw new ApiError(404, "User not found");
    }

    // Same fallback as accept: verify against BOTH the legacy array and the
    // FriendRequest collection so a desynced array can't block a valid reject.
    const inArray = me.friendRequests.some((id) => id.equals(sender._id));
    const inCollection = await FriendRequest.exists({
      sender: sender._id,
      receiver: me._id,
      status: "pending",
    });

    if (!inArray && !inCollection) {
      throw new ApiError(404, "No pending friend request from this user");
    }

    me.friendRequests = me.friendRequests.filter((id) => !id.equals(sender._id));
    sender.sentRequests = sender.sentRequests.filter((id) => !id.equals(me._id));

    await Promise.all([me.save(), sender.save()]);

await FriendRequest.updateMany(
      {
        sender: sender._id,
        receiver: me._id,
        status: "pending",
      },
      { status: "rejected" }
    );

    // 🔔 Mark the pending friend-request notification as "declined" and push
    // the updated notification to the receiver's UI in real time.
    await updateNotificationStatus(myId, senderId, "declined");

    const io = getIO();
    if (io) {
      io.to(`user:${senderId}`).emit("friendRequestRejected", { userId: myId });
      io.to(`user:${senderId}`).emit("friend:declined", {
        userId: myId,
      });
      io.to(`user:${myId}`).emit("friend:declined", {
        userId: String(senderId),
      });
      io.to(`user:${myId}`).emit("friendsUpdated", {});
    }

    return res.status(200).json({
      success: true,
      message: "Friend request rejected",
    });
  }
);

/**
 * DELETE /api/friends/:id
 * Remove a friendship (both directions) and notify the removed peer.
 */
export const removeFriendController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = getUserId(req);
    const friendId = assertObjectId(req.params.id, "user id");

    await removeFriend(myId, friendId);

    return res.status(200).json({
      success: true,
      message: "Friend removed",
    });
  }
);

/** Build a safe minimal friend payload for the accept response. */
const meSafeFor = (me: { _id: unknown; name: string; username: string; avatar?: string; bio?: string; isOnline?: boolean; lastSeen?: Date }) => ({
  _id: String(me._id),
  name: me.name,
  username: me.username,
  avatar: me.avatar,
  bio: me.bio,
  isOnline: Boolean(me.isOnline),
  lastSeen: me.lastSeen ? me.lastSeen.toISOString() : null,
});
