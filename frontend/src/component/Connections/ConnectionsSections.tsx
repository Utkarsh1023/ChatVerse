import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import axios from "axios";
import {
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineStar,
  HiOutlineInbox,
  HiOutlineSparkles,
} from "react-icons/hi2";
import type { ConnectionsDataHook } from "./useConnectionsData";
import UserCard from "./UserCard";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";
import {
  removeFriend,
  removeFollower,
  unfollowUser,
  followUser,
  acceptFriendRequest,
  rejectFriendRequest,
  sendFriendRequest,
} from "../../services/friendService";

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
};

export default function ConnectionsSections({ data }: { data: ConnectionsDataHook }) {
  const {
    activeTab,
    loading,
    error,
    friends,
    followers,
    following,
    friendRequests,
    suggestions,
    removeFriendLocally,
    removeFollowerLocally,
    unfollowLocally,
    acceptRequestLocally,
    declineRequestLocally,
    followBackLocally,
    addFriendLocally,
    reload,
  } = data;

  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const withBusy = useCallback(async (userId: string, fn: () => Promise<void>) => {
    if (busyIds.has(userId)) return;
    setBusyIds((prev) => new Set(prev).add(userId));
    try {
      await fn();
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }, [busyIds]);

  const handleRemoveFriend = (userId: string, name: string) => {
    removeFriendLocally(userId);
    withBusy(userId, () => removeFriend(userId))
      .catch((err) => {
        toast.error(getErrorMessage(err, "Could not remove friend."));
        reload();
      })
      .then(() => toast.info(`${name} removed from friends`));
  };

  const handleRemoveFollower = (userId: string, name: string) => {
    removeFollowerLocally(userId);
    withBusy(userId, () => removeFollower(userId))
      .catch((err) => {
        toast.error(getErrorMessage(err, "Could not remove follower."));
        reload();
      })
      .then(() => toast.info(`${name} removed from followers`));
  };

  const handleUnfollow = (userId: string, name: string) => {
    unfollowLocally(userId);
    withBusy(userId, () => unfollowUser(userId))
      .catch((err) => {
        toast.error(getErrorMessage(err, "Could not unfollow."));
        reload();
      })
      .then(() => toast.info(`Unfollowed ${name}`));
  };

  const handleFollowBack = (userId: string, name: string) => {
    followBackLocally(userId);
    withBusy(userId, () => followUser(userId)).catch((err) => {
      toast.error(getErrorMessage(err, "Could not follow back."));
      reload();
    });
  };

  const handleAcceptRequest = (userId: string, name: string) => {
    acceptRequestLocally(userId);
    withBusy(userId, () => acceptFriendRequest(userId).then(() => {}))
      .then(() =>
        toast.success(`You and ${name} are now friends 🎉`)
      )
      .catch((err) => {
        toast.error(getErrorMessage(err, "Could not accept request."));
        reload();
      });
  };

  const handleDeclineRequest = (userId: string, name: string) => {
    declineRequestLocally(userId);
    withBusy(userId, () => rejectFriendRequest(userId))
      .then(() => toast.info(`Friend request from ${name} declined`))
      .catch((err) => {
        toast.error(getErrorMessage(err, "Could not decline request."));
        reload();
      });
  };

  const handleAddFriend = (userId: string, name: string) => {
    addFriendLocally(userId);
    withBusy(userId, () => sendFriendRequest(userId))
      .then(() => toast.success(`Friend request sent to ${name}`))
      .catch((err) => {
        toast.error(getErrorMessage(err, "Could not send request."));
        reload();
      });
  };

  const handleFollow = (userId: string, name: string) => {
    withBusy(userId, () => followUser(userId))
      .then(() => toast.success(`Following ${name}`))
      .catch((err) => {
        toast.error(getErrorMessage(err, "Could not follow."));
      });
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return `Since ${d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">
            Loading Connections...
          </h2>
        </div>
        <Skeleton count={6} />
      </section>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Could not load connections"
        description={error}
        icon={<HiOutlineInbox className="text-3xl text-slate-500" />}
      />
    );
  }

  return (
    <section className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* --------------------------- Friends --------------------------- */}
          {activeTab === "friends" && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20">
                    <HiOutlineUsers className="text-2xl text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Friends</h2>
                    <p className="text-sm text-slate-400">
                      {friends.length} friend{friends.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
              {friends.length === 0 ? (
                <EmptyState
                  title="No friends yet"
                  description="When you accept friend requests, your friends will appear here."
                  icon={<HiOutlineUsers className="text-3xl text-slate-500" />}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <AnimatePresence>
                    {friends.map((friend) => (
                      <UserCard
                        key={friend._id}
                        variant="friend"
                        id={friend._id}
                        name={friend.name}
                        username={friend.username}
                        avatar={friend.avatar}
                        coverImage={friend.coverImage}
                        bio={friend.bio}
                        profession={friend.profession}
                        isOnline={friend.isOnline}
                        mutualFriends={friend.mutualFriends}
                        followers={friend.followers}
                        busy={busyIds.has(friend._id)}
                        onRemoveFriend={() =>
                          handleRemoveFriend(friend._id, friend.name)
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {/* --------------------------- Followers --------------------------- */}
          {activeTab === "followers" && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600/20 to-cyan-500/20">
                    <HiOutlineUserGroup className="text-2xl text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Followers</h2>
                    <p className="text-sm text-slate-400">
                      {followers.length} follower{followers.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
              {followers.length === 0 ? (
                <EmptyState
                  title="No followers yet"
                  description="People who follow you will appear here."
                  icon={<HiOutlineUserGroup className="text-3xl text-slate-500" />}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <AnimatePresence>
                    {followers.map((follower) => (
                      <UserCard
                        key={follower._id}
                        variant="follower"
                        id={follower._id}
                        name={follower.name}
                        username={follower.username}
                        avatar={follower.avatar}
                        bio={follower.bio}
                        profession={follower.profession}
                        isOnline={follower.isOnline}
                        isVerified={follower.isVerified}
                        dateLabel={formatDate(follower.followedAt)}
                        isFollowingBack={follower.isFollowingBack}
                        busy={busyIds.has(follower._id)}
                        onFollowBack={() =>
                          handleFollowBack(follower._id, follower.name)
                        }
                        onRemoveFollower={() =>
                          handleRemoveFollower(follower._id, follower.name)
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {/* --------------------------- Following --------------------------- */}
          {activeTab === "following" && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600/20 to-orange-500/20">
                    <HiOutlineStar className="text-2xl text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Following</h2>
                    <p className="text-sm text-slate-400">
                      {following.length} following
                    </p>
                  </div>
                </div>
              </div>
              {following.length === 0 ? (
                <EmptyState
                  title="Not following anyone"
                  description="People you follow will appear here."
                  icon={<HiOutlineStar className="text-3xl text-slate-500" />}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <AnimatePresence>
                    {following.map((user) => (
                      <UserCard
                        key={user._id}
                        variant="following"
                        id={user._id}
                        name={user.name}
                        username={user.username}
                        avatar={user.avatar}
                        bio={user.bio}
                        profession={user.profession}
                        isOnline={user.isOnline}
                        isVerified={user.isVerified}
                        dateLabel={formatDate(user.followingSince)}
                        isFriend={user.isFriend}
                        busy={busyIds.has(user._id)}
                        onUnfollow={() =>
                          handleUnfollow(user._id, user.name)
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {/* --------------------------- Requests --------------------------- */}
          {activeTab === "requests" && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600/20 to-violet-500/20">
                    <HiOutlineInbox className="text-2xl text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Friend Requests
                    </h2>
                    <p className="text-sm text-slate-400">
                      {friendRequests.length} pending
                    </p>
                  </div>
                </div>
              </div>
              {friendRequests.length === 0 ? (
                <EmptyState
                  title="No pending requests"
                  description="When someone sends you a friend request, it appears here instantly."
                  icon={<HiOutlineInbox className="text-3xl text-slate-500" />}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <AnimatePresence>
                    {friendRequests.map((request) => (
                      <UserCard
                        key={request._id}
                        variant="request"
                        id={request.sender._id}
                        name={request.sender.name}
                        username={request.sender.username}
                        avatar={request.sender.avatar}
                        profession={request.sender.profession}
                        isOnline={request.sender.isOnline}
                        mutualFriends={request.mutualFriends}
                        dateLabel={request.receivedAt}
                        busy={busyIds.has(request.sender._id)}
                        onAccept={() =>
                          handleAcceptRequest(request.sender._id, request.sender.name)
                        }
                        onDecline={() =>
                          handleDeclineRequest(request.sender._id, request.sender.name)
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {/* --------------------------- Suggestions --------------------------- */}
          {activeTab === "suggestions" && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600/20 to-violet-500/20">
                    <HiOutlineSparkles className="text-2xl text-fuchsia-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      People You May Know
                    </h2>
                    <p className="text-sm text-slate-400">
                      {suggestions.length} suggestions
                    </p>
                  </div>
                </div>
              </div>
              {suggestions.length === 0 ? (
                <EmptyState
                  title="No suggestions right now"
                  description="Check back later for new people to connect with."
                  icon={<HiOutlineSparkles className="text-3xl text-slate-500" />}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <AnimatePresence>
                    {suggestions.map((suggestion) => (
                      <UserCard
                        key={suggestion._id}
                        variant="suggestion"
                        id={suggestion._id}
                        name={suggestion.name}
                        username={suggestion.username}
                        avatar={suggestion.avatar}
                        profession={suggestion.profession}
                        isOnline={suggestion.isOnline}
                        mutualFriends={suggestion.mutualFriends}
                        followers={suggestion.followers}
                        busy={busyIds.has(suggestion._id)}
                        onAddFriend={() =>
                          handleAddFriend(suggestion._id, suggestion.name)
                        }
                        onFollow={() =>
                          handleFollow(suggestion._id, suggestion.name)
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
