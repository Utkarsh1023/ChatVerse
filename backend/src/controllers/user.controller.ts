import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import { AuthRequest } from "../middleware/verifyToken";

/**
 * Canonical relationship between the logged-in user and a searched user.
 * The frontend renders its action button from this single value:
 *
 *   "self"             → hide the card entirely (never shown in results)
 *   "friend"           → "Message"
 *   "request_sent"     → "Request Sent" (disabled)
 *   "request_received" → "Accept Request" (+ Decline)
 *   "none"             → "Add Friend"
 */
export type Relationship =
  | "self"
  | "friend"
  | "request_sent"
  | "request_received"
  | "none";

/** Safe, non-sensitive fields exposed on every search/suggestion result. */
const USER_SEARCH_SELECT =
  "name username avatar bio location profession isOnline lastSeen isVerified friends";

/** Normalise a Mongoose doc into a plain object (drops password etc). */
const toPlain = (u: any) => (u?.toObject ? u.toObject() : u);

/**
 * Compute the relationship between the caller and a target user id.
 *
 * @param myId      logged-in user's ObjectId (as string)
 * @param myFriends caller's `friends` array
 * @param mySent    caller's `sentRequests` array
 * @param myInbox   caller's `friendRequests` array
 * @param targetId  the target user's id (string)
 */
const computeRelationship = (
  myId: string,
  myFriends: mongoose.Types.ObjectId[] | undefined,
  mySent: mongoose.Types.ObjectId[] | undefined,
  myInbox: mongoose.Types.ObjectId[] | undefined,
  targetId: string
): Relationship => {
  if (myId === targetId) return "self";
  if (myFriends?.some((id) => id.toString() === targetId)) return "friend";
  if (mySent?.some((id) => id.toString() === targetId)) return "request_sent";
  if (myInbox?.some((id) => id.toString() === targetId))
    return "request_received";
  return "none";
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.q as string)?.trim();

    if (!query) {
      return res.status(200).json({
        success: true,
        count: 0,
        users: [],
      });
    }

    // Defensive: controllers in this codebase read either `req.user?.id`
    // (friend.controller) or `req.userId` (older code). Normalise once.
    const myId: string | undefined = req.user?.id || req.userId;

    if (!myId) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    // Validate myId is a well-formed ObjectId before using it in queries
    // (prevents a Mongoose CastError → 500 for malformed JWTs).
    if (!mongoose.Types.ObjectId.isValid(myId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

const [users, me] = await Promise.all([
      // Exclude the logged-in user at the database level.
      User.find({
        _id: { $ne: new mongoose.Types.ObjectId(myId) },
        $or: [
          { name: { $regex: query, $options: "i" } },
          { username: { $regex: query, $options: "i" } },
        ],
      })
        .select(USER_SEARCH_SELECT)
        .limit(20),
      User.findById(myId).select(
        "friends friendRequests sentRequests following"
      ),
    ]);

    // Build a Set of ids we've already tagged so we never return the same
    // user twice (defensive against any accidental duplicate docs).
    const seen = new Set<string>();

    // myFriends as a Set for O(1) mutual-friend / following lookups.
    const myFriendIds = new Set(
      (me?.friends ?? []).map((id) => id.toString())
    );
    const myFollowingIds = new Set(
      (me?.following ?? []).map((id) => id.toString())
    );

    const results = users
      .map((u: any) => {
        const doc = toPlain(u);
        const id = String(doc._id);

        // Belt & suspenders: never return the caller in their own results,
        // even if the `$ne` above failed for any reason.
        if (id === myId) return null;

        // Skip duplicates.
        if (seen.has(id)) return null;
        seen.add(id);

        const relationship = computeRelationship(
          myId,
          me?.friends,
          me?.sentRequests,
          me?.friendRequests,
          id
        );

        // Mutual-friend count: intersection of the target's friends with mine.
        const targetFriends = (u.friends ?? []).map((f: any) =>
          f.toString()
        );
        const mutualFriends = targetFriends.filter((f: string) =>
          myFriendIds.has(f)
        ).length;

        return {
          ...doc,
          // Canonical field consumed by the frontend button logic.
          relationship,
          // Backward-compatible flags (legacy consumers can keep working).
          isFriend: relationship === "friend",
          requestSent: relationship === "request_sent",
          incomingRequest: relationship === "request_received",
          // Extra dashboard fields.
          mutualFriends,
          isFollowing: myFollowingIds.has(id),
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      count: results.length,
      users: results,
    });
  } catch (error) {
    console.error("searchUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * GET /api/users/suggestions
 *
 * Return suggested users to connect with:
 *  - Excludes the caller
 *  - Excludes users already in the caller's `friends`
 *  - Excludes users the caller has already sent a request to (sentRequests)
 *  - Excludes users who have already sent the caller a request
 *    (friendRequests) — those appear in the Friend Requests panel instead
 *
 * Each suggestion is tagged with relationship flags so the UI can show the
 * correct button state without extra round-trips:
 *   isFriend         → already friends              (button: "Friends")
 *   requestSent      → we sent them a request       (button: "Request Sent")
 *   incomingRequest  → they sent us a request       (button: "Accept"/"Decline")
 *
 * Returns a stable, deterministic order (newest first).
 */
export const getSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const myId: string | undefined = req.user?.id || req.userId;

    if (!myId) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    // Validate myId is a well-formed ObjectId before using it in queries
    // (prevents a Mongoose CastError → 500 for malformed JWTs).
    if (!mongoose.Types.ObjectId.isValid(myId)) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    const me = await User.findById(myId).select(
      "friends friendRequests sentRequests"
    );

    if (!me) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Combine all ObjectIds we want to exclude from suggestions.
    const excludeIds = new Set(
      [
        ...(me.friends ?? []),
        ...(me.friendRequests ?? []),
        ...(me.sentRequests ?? []),
      ].map((id) => id.toString())
    );

    const users = await User.find({
      _id: { $ne: new mongoose.Types.ObjectId(myId) },
      ...(excludeIds.size
        ? { _id: { $nin: [...excludeIds].map((id) => id) } }
        : {}),
    })
      .select(USER_SEARCH_SELECT)
      .sort({ createdAt: -1 })
      .limit(20);

    // Suggestions by definition only contain users with no existing
    // relationship to the caller ("none") — but tag them explicitly so the
    // frontend can render a consistent, predictable button state.
    const seen = new Set<string>();
    const results = users
      .map((u: any) => {
        const doc = toPlain(u);
        const id = String(doc._id);

        if (id === myId || seen.has(id)) return null;
        seen.add(id);

        const relationship = computeRelationship(
          myId,
          me.friends,
          me.sentRequests,
          me.friendRequests,
          id
        );

        return {
          ...doc,
          relationship,
          isFriend: relationship === "friend",
          requestSent: relationship === "request_sent",
          incomingRequest: relationship === "request_received",
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      count: results.length,
      users: results,
    });
  } catch (error) {
    console.error("getSuggestions error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
