import { Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import FriendRequest from "../models/FriendRequest";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/verifyToken";
import { getIO } from "../socket/socket";
import {
  createNotification,
  updateNotificationStatus,
} from "../services/notification.service";
import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../services/friend.service";

/** Fields sent with real-time friend-request socket events. */
const SOCKET_USER_SELECT = "name username avatar bio isOnline lastSeen";

/**
 * Send a friend request from the authenticated user to the user in :id.
 *
 * Guards (in order):
 *   1. Authenticated user present
 *   2. :id is a well-formed MongoDB ObjectId
 *   3. Cannot request yourself
 *   4. Both users exist
 *   5. Cannot request an existing friend
 *   6. If the target user ALREADY sent us a request → auto-accept instead of
 *      creating a duplicate (mutual-follow behaviour)
 *   7. Duplicate request (we already sent one) → 409
 *
 * Uses `asyncHandler` + `ApiError` so errors flow to the global error handler
 * and return meaningful HTTP status codes instead of a swallowed 500.
 */
export const sendFriendRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const senderId = req.user?.id;
    const receiverId = req.params.id as string;

    // 1) Authenticated user guard.
    if (!senderId) {
      console.error("[sendFriendRequest] ❌ Missing authenticated user.");
      throw new ApiError(401, "Authentication failed");
    }

    // 1b) Sender must be a well-formed ObjectId (defensive — comes from JWT).
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      console.error("[sendFriendRequest] ❌ Invalid sender id:", senderId);
      throw new ApiError(401, "Authentication failed");
    }

    console.log(
      `[sendFriendRequest] ➡️ senderId=${senderId} receiverId=${receiverId}`
    );

    // 2) Validate the route param is a well-formed ObjectId BEFORE hitting the
    //    DB. This prevents a Mongoose CastError → 500 for garbage input.
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      console.error(
        `[sendFriendRequest] ❌ Invalid receiver id: "${receiverId}"`
      );
      throw new ApiError(400, "Invalid receiver ID");
    }

    // 3) Prevent sending a request to yourself.
    //    Compare as strings — senderId comes from JWT (string), receiverId
    //    from the URL. ObjectId equality also guards against case/format drift.
    if (senderId === receiverId) {
      console.error(
        `[sendFriendRequest] ❌ Cannot send request to yourself (${senderId})`
      );
      throw new ApiError(400, "You cannot send a friend request to yourself");
    }

    // 4) Both users must exist.
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender) {
      console.error(
        `[sendFriendRequest] ❌ Sender not found in DB: ${senderId}`
      );
      throw new ApiError(404, "User not found");
    }

    if (!receiver) {
      console.error(
        `[sendFriendRequest] ❌ Receiver not found in DB: ${receiverId}`
      );
      throw new ApiError(404, "User not found");
    }

    const senderObjectId = sender._id;
    const receiverObjectId = receiver._id;

    console.log(
      `[sendFriendRequest] ✅ Sender found: ${sender.name} (${sender.username})`
    );
    console.log(
      `[sendFriendRequest] ✅ Receiver found: ${receiver.name} (${receiver.username})`
    );
    console.log(
      `[sendFriendRequest] 📦 sender.friends=${JSON.stringify(
        sender.friends
      )}`
    );
    console.log(
      `[sendFriendRequest] 📦 sender.friendRequests=${JSON.stringify(
        sender.friendRequests
      )}`
    );
    console.log(
      `[sendFriendRequest] 📦 sender.sentRequests=${JSON.stringify(
        sender.sentRequests
      )}`
    );
    console.log(
      `[sendFriendRequest] 📦 receiver.friendRequests=${JSON.stringify(
        receiver.friendRequests
      )}`
    );
    console.log(
      `[sendFriendRequest] 📦 receiver.sentRequests=${JSON.stringify(
        receiver.sentRequests
      )}`
    );

    // 5) Already friends? (friendship is symmetric — both sides are stored.)
    if (sender.friends.some((id) => id.equals(receiverObjectId))) {
      console.error(
        `[sendFriendRequest] ❌ "${sender.username}" is already friends with "${receiver.username}"`
      );
      throw new ApiError(400, "You are already friends");
    }

    // 6) The target user ALREADY sent US a request → accept it instead of
    //    creating a duplicate. This is the "mutual" case.
    if (
      sender.friendRequests.some((id) => id.equals(receiverObjectId)) ||
      receiver.sentRequests.some((id) => id.equals(senderObjectId))
    ) {
      console.log(
        `[sendFriendRequest] 🤝 Mutual request detected — auto-accepting "${receiver.username}"`
      );

      // Remove the pending request from both sides.
      sender.friendRequests = sender.friendRequests.filter(
        (id) => !id.equals(receiverObjectId)
      );
      receiver.sentRequests = receiver.sentRequests.filter(
        (id) => !id.equals(senderObjectId)
      );

      // Add both sides as friends.
      sender.friends.push(receiverObjectId);
      receiver.friends.push(senderObjectId);

      await Promise.all([sender.save(), receiver.save()]);

      return res.status(200).json({
        success: true,
        message: "Friend request accepted — you are now friends",
        status: "accepted",
      });
    }

    // 7) Duplicate request — we already sent one that is still pending.
    if (
      sender.sentRequests.some((id) => id.equals(receiverObjectId)) ||
      receiver.friendRequests.some((id) => id.equals(senderObjectId))
    ) {
      console.error(
        `[sendFriendRequest] ❌ Duplicate — request already sent to "${receiver.username}"`
      );
      throw new ApiError(409, "Friend request already sent");
    }

    // 8) Create the request.
    sender.sentRequests.push(receiverObjectId);
    receiver.friendRequests.push(senderObjectId);

    await Promise.all([sender.save(), receiver.save()]);

    // Create the FriendRequest document (drives dashboard `receivedAt`).
    await FriendRequest.create({
      sender: senderObjectId,
      receiver: receiverObjectId,
      status: "pending",
    });

    // 🔔 Structured notification for the receiver.
    await createNotification({
      recipient: receiverObjectId,
      sender: senderObjectId,
      type: "friend_request",
    });

    // 🔔 Real-time: notify the receiver (if online) that they have a new
    // friend request so their panel updates without a manual refresh.
    const io = getIO();
    if (io) {
      const senderSafe = await User.findById(senderId).select(
        SOCKET_USER_SELECT
      );
      io.to(`user:${receiverId}`).emit("friendRequestReceived", {
        request: senderSafe,
        count: receiver.friendRequests.length,
      });
      io.to(`user:${receiverId}`).emit("requestReceived", {
        request: senderSafe,
        count: receiver.friendRequests.length,
      });
      io.to(`user:${receiverId}`).emit("friendsUpdated", {});
    }

    return res.status(201).json({
      success: true,
      message: "Friend request sent",
      status: "pending",
    });
  }
);

/**
 * Accept a pending friend request. Validates the request exists, removes it
 * from both sides, and adds each user to the other's friends list.
 */
export const acceptRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = req.user?.id;
    const senderId = req.params.id as string;

    if (!myId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { friend } = await acceptFriendRequest(myId, senderId);

    // 🔔 Mark the pending friend-request notification as "accepted" and push
    // the updated notification to the receiver's UI in real time.
    await updateNotificationStatus(myId, senderId, "accepted");

    // 🔔 Real-time: notify the original sender that their request was accepted
    // (they can update "Request Sent" → "Friends" instantly).
    const io = getIO();
    if (io) {
      const me = await User.findById(myId).select(SOCKET_USER_SELECT);
      io.to(`user:${senderId}`).emit("friendRequestAccepted", {
        friend: me,
      });
      io.to(`user:${senderId}`).emit("friend:accepted", {
        friend: me,
        by: String(myId),
      });
      io.to(`user:${myId}`).emit("friend:accepted", {
        friend: friend,
        by: String(myId),
      });
      io.to(`user:${myId}`).emit("friendsUpdated", {});
    }

    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
      friend,
    });
  }
);

/**
 * Reject a pending friend request. Removes it from both sides without
 * creating a friendship.
 */
export const rejectRequest = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = req.user?.id;
    const senderId = req.params.id as string;

    if (!myId) {
      throw new ApiError(401, "Unauthorized");
    }

    await rejectFriendRequest(myId, senderId);

    // 🔔 Mark the pending friend-request notification as "declined" and push
    // the updated notification to the receiver's UI in real time.
    await updateNotificationStatus(myId, senderId, "declined");

    // 🔔 Real-time: notify the original sender that their request was declined.
    const io = getIO();
    if (io) {
      io.to(`user:${senderId}`).emit("friendRequestRejected", {
        userId: myId,
      });
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
 * Return the authenticated user's friends list (populated).
 */
export const getFriends = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = req.user?.id;

    if (!myId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(myId).populate(
      "friends",
      "name username avatar bio location isOnline"
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json({
      success: true,
      friends: user.friends,
    });
  }
);

/**
 * Return the authenticated user's pending incoming friend requests.
 */
export const getRequests = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const myId = req.user?.id;

    if (!myId) {
      throw new ApiError(401, "Unauthorized");
    }

    const requests = await getFriendRequests(myId);

    return res.status(200).json({
      success: true,
      requests,
    });
  }
);

