/**
 * Strict TypeScript interfaces for the Friends Dashboard API.
 * No `any` anywhere — every shape is fully typed.
 */

export interface DashboardStats {
  friends: number;
  followers: number;
  following: number;
  requests: number;
  online: number;
}

/** Aggregated counts for a single user (computed via $size / $setIntersection). */
export interface UserCounts {
  followers: number;
  following: number;
  mutualFriends: number;
}

/** A single friend card in the dashboard's friends list. */
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
  /** Relationship to the caller — always "friend" here. */
  relationship: "friend";
}

/** A pending incoming friend request card. */
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

/** A suggested user card. */
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

/** A single recent-activity entry (also powers real-time notifications). */
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

/** Online friend shape (sorted by most recently active). */
export interface OnlineFriend {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  profession?: string;
  lastSeen?: string | null;
}

/** The full payload returned by GET /api/friends/dashboard. */
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

/** Pagination arguments parsed from the query string. */
export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

/** A single follower card (someone following the caller). */
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
  /** When this user started following the caller. */
  followedAt: string;
  /** Whether the caller already follows them back. */
  isFollowingBack: boolean;
  /** Whether they are already friends with the caller. */
  isFriend: boolean;
}

/** A single following card (someone the caller follows). */
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
  /** When the caller started following this user. */
  followingSince: string;
  /** Whether they are already friends with the caller. */
  isFriend: boolean;
}

/** The full payload returned by GET /api/connections/dashboard. */
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
