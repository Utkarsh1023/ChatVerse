import mongoose from "mongoose";
import User from "../models/User";
import FriendRequest from "../models/FriendRequest";
import ApiError from "../utils/ApiError";
import { createNotification } from "./notification.service";

/**
 * Friend request service layer.
 *
 * Centralises all friend-request business logic so controllers stay thin
 * and the same rules are reused everywhere.
 */

/** Fields exposed to the client for a friend-request sender. */
const REQUEST_SELECT = "name username avatar bio isOnline lastSeen";

/** Fields exposed for an accepted friend. */
const FRIEND_SELECT = "name username avatar bio location isOnline lastSeen";

/** Strip internal Mongoose documents down to plain serialisable objects. */
const toSafeUser = (doc: any) => (doc ? doc.toObject?.() ?? doc : doc);

/**
 * Return the authenticated user's pending incoming friend requests,
 * populated with safe (non-sensitive) fields only.
 */
export const getFriendRequests = async (userId: string) => {
  const user = await User.findById(userId).populate(
    "friendRequests",
    REQUEST_SELECT
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return (user.friendRequests ?? []).map(toSafeUser);
};

/**
 * Accept a pending friend request from `senderId`.
 *
 * - Removes the sender from the receiver's `friendRequests`.
 * - Removes the receiver from the sender's `sentRequests`.
 * - Adds both users to each other's `friends` (idempotent — no duplicates).
 * - Returns the sanitised newly-added friend so the UI can update instantly.
 */
export const acceptFriendRequest = async (
  userId: string,
  senderId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(senderId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (userId === senderId) {
    throw new ApiError(400, "Invalid request");
  }

  const me = await User.findById(userId);
  const sender = await User.findById(senderId);

  if (!me || !sender) {
    throw new ApiError(404, "User not found");
  }

  // There must actually be a pending request from this sender.
  if (!me.friendRequests.some((id) => id.equals(sender._id))) {
    throw new ApiError(404, "No pending friend request from this user");
  }

  // Remove the pending request from both sides.
  me.friendRequests = me.friendRequests.filter((id) => !id.equals(sender._id));
  sender.sentRequests = sender.sentRequests.filter((id) => !id.equals(me._id));

  // Add as friends — idempotent via the duplicate guards.
  if (!me.friends.some((id) => id.equals(sender._id))) {
    me.friends.push(sender._id);
  }
  if (!sender.friends.some((id) => id.equals(me._id))) {
    sender.friends.push(me._id);
  }

  await Promise.all([me.save(), sender.save()]);

  // Keep the FriendRequest collection in sync (drives dashboard `receivedAt`).
  await FriendRequest.updateMany(
    {
      sender: sender._id,
      receiver: me._id,
      status: "pending",
    },
    { status: "accepted" }
  );

// Activity/notification for the original sender.
  await createNotification({
    recipient: sender._id,
    sender: me._id,
    type: "friend_accept",
  });

  // Return the freshly-added friend (safe fields only).
  const friend = await User.findById(sender._id).select(FRIEND_SELECT);

  return {
    friend: toSafeUser(friend),
  };
};

/**
 * Reject a pending friend request from `senderId`.
 *
 * Removes the pending request from both sides WITHOUT creating a friendship.
 */
export const rejectFriendRequest = async (
  userId: string,
  senderId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(senderId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const me = await User.findById(userId);
  const sender = await User.findById(senderId);

  if (!me || !sender) {
    throw new ApiError(404, "User not found");
  }

  if (!me.friendRequests.some((id) => id.equals(sender._id))) {
    throw new ApiError(404, "No pending friend request from this user");
  }

me.friendRequests = me.friendRequests.filter((id) => !id.equals(sender._id));
  sender.sentRequests = sender.sentRequests.filter((id) => !id.equals(me._id));

  await Promise.all([me.save(), sender.save()]);

  // Keep the FriendRequest collection in sync (drives dashboard `receivedAt`).
  await FriendRequest.updateMany(
    {
      sender: sender._id,
      receiver: me._id,
      status: "pending",
    },
    { status: "rejected" }
  );

  return { rejectedUserId: senderId };
};

