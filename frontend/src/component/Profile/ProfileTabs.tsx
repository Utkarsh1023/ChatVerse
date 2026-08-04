import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPosts,
  getFriends,
  getFollowers,
  getFollowing,
  type ProfilePost,
  type UserProfile,
} from "../../api/profile";
import { createOrGetConversation } from "../../services/chatService";
import UserCard from "./UserCard";
import {
  FiGrid,
  FiUsers,
  FiUserPlus,
  FiHeart,
  FiLoader,
} from "react-icons/fi";

type TabId = 
       "posts" 
      | "friends"
      // | "followers"
      // | "following";

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState<TabId>("posts");

  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

// useParams() returns the URL segment — the USERNAME (e.g. /profile/john).
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  /** Create/fetch the conversation with a user, then open it in the chat. */
  const handleMessage = useCallback(
    async (user: UserProfile) => {
      try {
        const conversation = await createOrGetConversation(user._id);
        navigate(`/dashboard/chats?conversation=${conversation._id}`);
      } catch (err) {
        console.error("Failed to open conversation:", err);
      }
    },
    [navigate]
  );

  /** Navigate to the selected user's profile page. */
  const handleProfile = useCallback(
    (user: UserProfile) => {
      navigate(`/dashboard/profile/${user.username}`);
    },
    [navigate]
  );

  // 🐞 TRACE: confirm the username and active tab driving the fetch.
  console.log(`[ProfileTabs] username = "${username}", activeTab = "${activeTab}"`);
  console.log(`[ProfileTabs] posts state =>`, posts);

  const tabs = [
    { id: "posts" as TabId, label: "Posts", icon: FiGrid, count: posts.length },
    { id: "friends" as TabId, label: "Friends", icon: FiUsers, count: friends.length },
    // { id: "followers" as TabId, label: "Followers", icon: FiHeart, count: followers.length },
    // { id: "following" as TabId, label: "Following", icon: FiUserPlus, count: following.length },
  ];

  useEffect(() => {
  if (!username) return;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

switch (activeTab) {
        case "posts": {
          const data = await getPosts(username);
          // 🐞 TRACE: confirm the resolved posts array before setting state.
          console.log(`[ProfileTabs] posts resolved =>`, data);
          setPosts(data ?? []);
          break;
        }

        case "friends": {
          const data = await getFriends(username);
          console.log(`[ProfileTabs] friends resolved =>`, data);
          setFriends(data ?? []);
          break;
        }

        // case "followers": {
        //   const data = await getFollowers(username);
        //   console.log(`[ProfileTabs] followers resolved =>`, data);
        //   setFollowers(data ?? []);
        //   break;
        // }

        // case "following": {
        //   const data = await getFollowing(username);
        //   console.log(`[ProfileTabs] following resolved =>`, data);
        //   setFollowing(data ?? []);
        //   break;
        // }
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [activeTab, username]);

  return (
    <div className="mt-1 space-y-1">
      {/* Tabs */}
      <div className="rounded-3xl border border-slate-700 bg-[#0F172A] p-2 shadow-[0_0_30px_rgba(168,85,247,.12)]">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative overflow-hidden rounded-2xl p-4"
              >
                {active && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center gap-3">

                  <Icon
                    size={22}
                    className={active ? "text-white" : "text-slate-400"}
                  />

                  <h2
                    className={`text-lg font-bold ${
                      active ? "text-white" : "text-slate-100"
                    }`}
                  >
                    {tab.count}
                  </h2>

                  <p className={`text-sm font-medium ${
                    active ? "text-white" : "text-slate-400"
                  }`}>
                    {tab.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Loading state */}
        {loading && (
          <motion.div
            key={`loading-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-16 text-slate-400"
          >
            <FiLoader className="animate-spin text-3xl text-fuchsia-400" />
            <p>Loading {activeTab}...</p>
          </motion.div>
        )}

        {/* Error state */}
        {!loading && error && (
          <motion.div
            key={`error-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Posts tab */}
        {!loading && !error && activeTab === "posts" && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
            {posts.length === 0 ? (
              <p className="col-span-full py-10 text-center text-slate-400">
                No posts yet.
              </p>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="rounded-3xl border border-slate-700 bg-[#0F172A] p-5"
                >
                  {post.media?.[0]?.url && (
                    <img
                      src={post.media[0].url}
                      alt={post.caption || "Post"}
                      className="h-48 w-full rounded-2xl object-cover"
                    />
                  )}

                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {post.caption || "No Caption"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {post.likesCount} likes · {post.commentsCount} comments
                  </p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Friends tab */}
        {!loading && !error && activeTab === "friends" && (
          <motion.div
            key="friends"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
{friends.length === 0 ? (
              <p className="col-span-full py-10 text-center text-slate-400">
                No friends found.
              </p>
            ) : (
              friends.map((friend) => (
                <UserCard
                  key={friend._id}
                  user={friend}
                  onMessage={handleMessage}
                  onProfile={handleProfile}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Followers tab */}
        {/* {!loading && !error && activeTab === "followers" && (
          <motion.div
            key="followers"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
            {followers.length === 0 ? (
              <p className="col-span-full py-10 text-center text-slate-400">
                No followers.
              </p>
            ) : (
              followers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  onMessage={handleMessage}
                  onProfile={handleProfile}
                />
              ))
            )}
          </motion.div>
        )} */}

        {/* Following tab */}
        {/* {!loading && !error && activeTab === "following" && (
          <motion.div
            key="following"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
            {following.length === 0 ? (
              <p className="col-span-full py-10 text-center text-slate-400">
                Not following anyone.
              </p>
            ) : (
              following.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  onMessage={handleMessage}
                  onProfile={handleProfile}
                />
              ))
            )}
          </motion.div>
        )} */}
      </AnimatePresence>
    </div>
  );
}
