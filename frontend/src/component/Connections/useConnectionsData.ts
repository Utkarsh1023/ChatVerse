import { useCallback, useEffect, useRef, useState } from "react";
import { useSocketContext } from "../../context/SocketContext";
import {
  getConnectionsDashboard,
  DashboardStats,
  FriendCard,
  FollowerCard,
  FollowingCard,
  FriendRequestCard,
  SuggestionCard,
} from "../../services/friendService";

const EMPTY_STATS: DashboardStats = {
  friends: 0,
  followers: 0,
  following: 0,
  requests: 0,
  online: 0,
};

export type ConnectionsTab =
  | "friends"
  | "followers"
  | "following"
  | "requests"
  | "suggestions";

interface ConnectionsData {
  stats: DashboardStats;
  friends: FriendCard[];
  followers: FollowerCard[];
  following: FollowingCard[];
  friendRequests: FriendRequestCard[];
  suggestions: SuggestionCard[];
  loading: boolean;
  error: string;
  activeTab: ConnectionsTab;
  setActiveTab: (tab: ConnectionsTab) => void;
  reload: () => Promise<void>;
  countFor: (tab: ConnectionsTab) => number;
  // Mutations — each updates local state optimistically + re-syncs stats.
  removeFriendLocally: (userId: string) => void;
  removeFollowerLocally: (userId: string) => void;
  unfollowLocally: (userId: string) => void;
  acceptRequestLocally: (userId: string) => void;
  declineRequestLocally: (userId: string) => void;
  followBackLocally: (userId: string) => void;
  addFriendLocally: (userId: string) => void;
}

/**
 * Global state + real-time socket store for the Connections dashboard.
 * Fetches the single `/connections/dashboard` payload once and keeps all
 * sections in sync as socket events arrive.
 */
export function useConnectionsData(): ConnectionsData {
  const { socket } = useSocketContext();
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [friends, setFriends] = useState<FriendCard[]>([]);
  const [followers, setFollowers] = useState<FollowerCard[]>([]);
  const [following, setFollowing] = useState<FollowingCard[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestCard[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ConnectionsTab>("friends");
  const statsRef = useRef<DashboardStats>(EMPTY_STATS);

  const setStatsAll = useCallback(
    (s: DashboardStats | ((prev: DashboardStats) => DashboardStats)) => {
      const next =
        typeof s === "function" ? s(statsRef.current) : s;
      statsRef.current = next;
      setStats(next);
    },
    []
  );

  /** Fetch the full dashboard payload. */
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getConnectionsDashboard(1, 50);
      setFriends(data.friends ?? []);
      setFollowers(data.followers ?? []);
      setFollowing(data.following ?? []);
      setFriendRequests(data.friendRequests ?? []);
      setSuggestions(data.suggestions ?? []);
      setStatsAll(data.stats ?? EMPTY_STATS);
    } catch (err) {
      console.error("Failed to load connections dashboard:", err);
      setError("Could not load connections. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [setStatsAll]);

  useEffect(() => {
    reload();
  }, [reload]);

  /* ------------------------- Local mutations ------------------------- */

  const removeFriendLocally = useCallback((userId: string) => {
    setFriends((prev) => prev.filter((f) => f._id !== userId));
    setStatsAll((s) => ({ ...s, friends: Math.max(0, s.friends - 1) }));
    setSuggestions((prev) =>
      prev.filter((sug) => sug._id !== userId)
    );
  }, [setStatsAll]);

  const removeFollowerLocally = useCallback((userId: string) => {
    setFollowers((prev) => prev.filter((f) => f._id !== userId));
    setStatsAll((s) => ({
      ...s,
      followers: Math.max(0, s.followers - 1),
    }));
  }, [setStatsAll]);

  const unfollowLocally = useCallback((userId: string) => {
    setFollowing((prev) => prev.filter((f) => f._id !== userId));
    setStatsAll((s) => ({
      ...s,
      following: Math.max(0, s.following - 1),
    }));
  }, [setStatsAll]);

  const acceptRequestLocally = useCallback((userId: string) => {
    setFriendRequests((prev) =>
      prev.filter((r) => r.sender._id !== userId)
    );
    setStatsAll((s) => ({
      ...s,
      requests: Math.max(0, s.requests - 1),
      friends: s.friends + 1,
    }));
  }, [setStatsAll]);

  const declineRequestLocally = useCallback((userId: string) => {
    setFriendRequests((prev) =>
      prev.filter((r) => r.sender._id !== userId)
    );
    setStatsAll((s) => ({
      ...s,
      requests: Math.max(0, s.requests - 1),
    }));
  }, [setStatsAll]);

  const followBackLocally = useCallback((userId: string) => {
    setFollowers((prev) =>
      prev.map((f) =>
        f._id === userId ? { ...f, isFollowingBack: true } : f
      )
    );
    setStatsAll((s) => ({ ...s, following: s.following + 1 }));
  }, [setStatsAll]);

  const addFriendLocally = useCallback((userId: string) => {
    setSuggestions((prev) => prev.filter((s) => s._id !== userId));
  }, []);

  /* ------------------------ Real-time sync --------------------------- */

  useEffect(() => {
    if (!socket) return;

    // New incoming friend request → prepend to the requests list.
    const onRequestReceived = () => {
      reload();
    };

    // Our request was accepted by the other user → they become a friend.
    const onFriendAccepted = (data: { friend: { _id?: string } }) => {
      setFriendRequests((prev) =>
        prev.filter((r) => r.sender._id !== data.friend?._id)
      );
      reload();
    };

    // A friend removed us → drop them from friends.
    const onFriendRemoved = (data: { userId: string }) => {
      setFriends((prev) => prev.filter((f) => f._id !== data.userId));
      setStatsAll((s) => ({
        ...s,
        friends: Math.max(0, s.friends - 1),
        followers: Math.max(
          0,
          s.followers - (data.userId ? 1 : 0)
        ),
      }));
    };

    // Generic "something changed" → re-sync everything from the server.
    const onFriendsUpdated = () => {
      reload();
    };

    // New follower.
    const onNewFollower = () => reload();

    // Someone we follow unfollowed us / removed us.
    const onUnfollowed = (data: { userId: string }) => {
      setFollowers((prev) => prev.filter((f) => f._id !== data.userId));
      reload();
    };

    // A user removed us from their followers → we lose a following.
    const onFollowerRemoved = (data: { removedBy: string }) => {
      setFollowing((prev) =>
        prev.filter((f) => f._id !== data.removedBy)
      );
      setStatsAll((s) => ({
        ...s,
        following: Math.max(0, s.following - 1),
      }));
    };

    // Following list changed.
    const onFollowingUpdated = () => reload();

    // Followers list changed.
    const onFollowersUpdated = () => reload();

    // Profile updated → re-sync names/avatars.
    const onProfileUpdated = () => reload();

    // Online / offline status → re-sync.
    const onOnlineChange = () => reload();

    socket.on("requestReceived", onRequestReceived);
    socket.on("friendRequestReceived", onRequestReceived);
    socket.on("friendRequestAccepted", onFriendAccepted);
    socket.on("friendAccepted", onFriendAccepted);
    socket.on("friendRequestRejected", () => reload());
    socket.on("friendRemoved", onFriendRemoved);
    socket.on("friendsUpdated", onFriendsUpdated);
    socket.on("newFollower", onNewFollower);
    socket.on("unfollowed", onUnfollowed);
    socket.on("followerRemoved", onFollowerRemoved);
    socket.on("followingUpdated", onFollowingUpdated);
    socket.on("followersUpdated", onFollowersUpdated);
    socket.on("profileUpdated", onProfileUpdated);
    socket.on("friendOnline", onOnlineChange);
    socket.on("friendOffline", onOnlineChange);

    return () => {
      socket.off("requestReceived", onRequestReceived);
      socket.off("friendRequestReceived", onRequestReceived);
      socket.off("friendRequestAccepted", onFriendAccepted);
      socket.off("friendAccepted", onFriendAccepted);
      socket.off("friendRequestRejected");
      socket.off("friendRemoved", onFriendRemoved);
      socket.off("friendsUpdated", onFriendsUpdated);
      socket.off("newFollower", onNewFollower);
      socket.off("unfollowed", onUnfollowed);
      socket.off("followerRemoved", onFollowerRemoved);
      socket.off("followingUpdated", onFollowingUpdated);
      socket.off("followersUpdated", onFollowersUpdated);
      socket.off("profileUpdated", onProfileUpdated);
      socket.off("friendOnline", onOnlineChange);
      socket.off("friendOffline", onOnlineChange);
    };
  }, [socket, reload, setStatsAll]);

  const countFor = useCallback(
    (tab: ConnectionsTab): number => {
      switch (tab) {
        case "friends":
          return stats.friends;
        case "followers":
          return stats.followers;
        case "following":
          return stats.following;
        case "requests":
          return stats.requests;
        case "suggestions":
          return suggestions.length;
        default:
          return 0;
      }
    },
    [stats, suggestions]
  );

  return {
    stats,
    friends,
    followers,
    following,
    friendRequests,
    suggestions,
    loading,
    error,
    activeTab,
    setActiveTab,
    reload,
    countFor,
    removeFriendLocally,
    removeFollowerLocally,
    unfollowLocally,
    acceptRequestLocally,
    declineRequestLocally,
    followBackLocally,
    addFriendLocally,
  };
}

export type ConnectionsDataHook = ReturnType<typeof useConnectionsData>;

