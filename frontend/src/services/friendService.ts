import API from "../api/axios";
import type { User } from "../types/user";

/**
 * Friend request service layer.
 *
 * Thin typed wrappers around the friend-request endpoints so components
 * never talk to axios directly.
 */

/** Dashboard types mirroring the backend `dashboardTypes.ts`. */
export interface DashboardStats {
  friends: number;
  followers: number;
  following: number;
  requests: number;
  online: number;
}

export interface FriendCard {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  country?: string;
  profession?: string;
  isOnline: boolean;
  lastSeen?: string | null;
  followers: number;
  following: number;
  mutualFriends: number;
  createdAt: string;
  relationship: "friend";
}

export interface FriendRequestCard {
  _id: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
    profession?: string;
    isOnline: boolean;
    lastSeen?: string | null;
  };
  mutualFriends: number;
  receivedAt: string;
}

export interface SuggestionCard {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  profession?: string;
  isOnline: boolean;
  lastSeen?: string | null;
  followers: number;
  mutualFriends: number;
  relationship: "none";
}

export interface RecentActivity {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  } | null;
}

export interface OnlineFriend {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  profession?: string;
  lastSeen?: string | null;
}

export interface DashboardResponse {
  success: true;
  stats: DashboardStats;
  onlineFriends: OnlineFriend[];
  friendRequests: FriendRequestCard[];
  suggestions: SuggestionCard[];
  recentActivity: RecentActivity[];
  friends: FriendCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface FriendRequestResponse {
  success: boolean;
  requests: User[];
}

export interface AcceptFriendResponse {
  success: boolean;
  message: string;
  friend: User;
}

export interface RejectFriendResponse {
  success: boolean;
  message: string;
}

/** GET /api/friends/requests — fetch pending incoming friend requests. */
export const getFriendRequests = async (): Promise<User[]> => {
  const res = await API.get<FriendRequestResponse>("/friends/requests");
  return res.data?.requests ?? [];
};

/** POST /api/friends/request/:userId — send a friend request to a user. */
export const sendFriendRequest = async (userId: string): Promise<void> => {
  await API.post(`/friends/request/${userId}`);
};

/** PUT /api/friends/accept/:userId — accept a request from a user. */
export const acceptFriendRequest = async (
  userId: string
): Promise<User> => {
  const res = await API.put<AcceptFriendResponse>(
    `/friends/accept/${userId}`
  );
  return res.data?.friend;
};

/** PUT /api/friends/reject/:userId — decline a request from a user. */
export const rejectFriendRequest = async (
  userId: string
): Promise<void> => {
  await API.put<RejectFriendResponse>(`/friends/reject/${userId}`);
};

/**
 * GET /api/friends/dashboard — the single-request Friends page payload.
 * Supports pagination/infinite-scroll params for the friends list.
 */
export const getFriendsDashboard = async (
  page = 1,
  limit = 20
): Promise<DashboardResponse> => {
  const res = await API.get<DashboardResponse>("/friends/dashboard", {
    params: { page, limit },
  });
  return res.data;
};

/** Follower card shape (mirrors backend FollowerCard). */
export interface FollowerCard {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  profession?: string;
  isOnline: boolean;
  isVerified: boolean;
  lastSeen?: string | null;
  followedAt: string;
  isFollowingBack: boolean;
  isFriend: boolean;
}

/** Following card shape (mirrors backend FollowingCard). */
export interface FollowingCard {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  profession?: string;
  isOnline: boolean;
  isVerified: boolean;
  lastSeen?: string | null;
  followingSince: string;
  isFriend: boolean;
}

/** Unified Connections dashboard payload. */
export interface ConnectionsResponse {
  success: true;
  stats: DashboardStats;
  friends: FriendCard[];
  followers: FollowerCard[];
  following: FollowingCard[];
  friendRequests: FriendRequestCard[];
  suggestions: SuggestionCard[];
  onlineFriends: OnlineFriend[];
  recentActivity: RecentActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * GET /api/connections/dashboard — the single-request Connections page payload.
 */
export const getConnectionsDashboard = async (
  page = 1,
  limit = 50
): Promise<ConnectionsResponse> => {
  const res = await API.get<ConnectionsResponse>("/connections/dashboard", {
    params: { page, limit },
  });
  return res.data;
};

/** POST /api/connections/follow/:userId — follow a user. */
export const followUser = async (userId: string): Promise<void> => {
  await API.post(`/connections/follow/${userId}`);
};

/** DELETE /api/connections/unfollow/:userId — unfollow a user. */
export const unfollowUser = async (userId: string): Promise<void> => {
  await API.delete(`/connections/unfollow/${userId}`);
};

/** DELETE /api/connections/followers/:userId — remove a follower. */
export const removeFollower = async (userId: string): Promise<void> => {
  await API.delete(`/connections/followers/${userId}`);
};

/** DELETE /api/friends/:friendId — remove a friendship. */
export const removeFriend = async (friendId: string): Promise<void> => {
  await API.delete(`/friends/${friendId}`);
};

