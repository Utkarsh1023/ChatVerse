import { useState, useEffect } from "react";
import { getPosts } from "../../api/postApi";
import Sidebar from "../layouts/Sidebar";
import HomeHeader from "./HomeHeader";
import StoryBar from "./StoryBar";
import Feed from "./Feed";
import RightPanel from "./RightPanel";
import CreatePostModal from "../CreatePostModel";
import CreateStoryModal from "../CreateStoryModel";
import StoryViewerModal from "../StoryViewerModal";
import CreateSearchModal from "../CreateSearchModal";
import MobileBottomNav from "../layouts/MobileBottomNav";
import { getStories, normalizeStoryUser } from "../../api/story";
import { useAuth } from "../../context/AuthContext";
import type { StoryGroup } from "../../types/story";

export default function HomePage() {
  const { user } = useAuth();
  const [openPost, setOpenPost] = useState(false);
  const [openStory, setOpenStory] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState([]);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const fetchPosts = async () => {
    setPostsLoading(true);
    setPostsError(null);
    try {
      const res = await getPosts();
      setPosts(res.data.posts);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to load posts. Please make sure you are logged in.";
      console.error("Failed to fetch posts:", message);
      setPostsError(message);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  /**
   * GET /stories now returns GROUPED data:
   *   [ { user: {...}, stories: [ {...}, {...} ] }, ... ]
   * One circle per user, chronological stories inside each group.
   */
  const fetchStories = async () => {
    try {
      const res = await getStories();

      const groups: StoryGroup[] = (res ?? []).map((group: any) => ({
        user: normalizeStoryUser(group.user),
        stories: (group.stories ?? []).map((story: any) => ({
          _id: story._id,
          user: story.user,
          media: story.media,
          type: story.type,
          caption: story.caption,
          createdAt: story.createdAt,
          expiresAt: story.expiresAt,
        })),
      }));

      setStoryGroups(groups);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStoryDeleted = async () => {
    await fetchStories();
  };
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Home */}
      <div className="h-screen bg-slate-950 p-2 pb-20 d:pb-2">
        <div className="mx-auto h-[calc(100vh-24px-80px)] md:h-[calc(100vh-22px)] max-w-full overflow-hidden">
          <div className="flex h-full gap-2 overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl">
            {/* Sidebar */}
            <div className="hidden shrink-0 lg:block">
              <Sidebar 
                username={user?.username || ""} 
                onOpenCreatePost={() => setOpenPost(true)}
                onOpenSearch={() => setOpenSearch(true)}
              />
            </div>

            {/* Main */}
            <div className="flex min-w-0 flex-1">

              {/* Feed */}
              <div className="ml-2 min-w-0 flex-1">

                <div className="flex h-full flex-col rounded-3xl bg-slate-900/70">

                  <HomeHeader
                    onCreatePost={() => setOpenPost(true)}
                  />

                  <div className="flex-1 mt-2 overflow-y-auto pb-28 md:pb-0">

                    <StoryBar
                      groups={storyGroups}
                      onCreateStory={() => setOpenStory(true)}
                      onOpenStory={(group) => setSelectedUserId(group.user._id)}
                    />
                    <div className="border-t border-slate-800" />
                    <Feed posts={posts} error={postsError} loading={postsLoading} />

                  </div>

                </div>

              </div>

              {/* Right Panel */}
              <div className="ml-2 hidden xl:block">
                <RightPanel />
              </div>

            </div>

          </div>

        </div>
        <div
  className="
    fixed
    inset-x-0
    bottom-0
    z-50
    border-t
    border-slate-800
    bg-slate-900/95
    backdrop-blur-xl
    pb-[env(safe-area-inset-bottom)]
    lg:hidden
  "
>
  <MobileBottomNav
  onOpenSearch={() => setOpenSearch(true)}
  onOpenCreatePost={() => setCreatePostOpen(true)}
/>
</div>
      </div>

      {/* Modal - OUTSIDE the page */}
      <CreatePostModal
        open={openPost}
        onClose={() => setOpenPost(false)}
        onPostCreated={fetchPosts}
      />
      <CreateStoryModal
        open={openStory}
        onClose={() => setOpenStory(false)}
        onUploaded={async () => {
          await fetchStories();
          setOpenStory(false);
        }}
      />

      <StoryViewerModal
        open={selectedUserId !== null}
        groups={storyGroups}
        initialUserId={selectedUserId}
        currentUserId={user?.id || null}
        onClose={() => setSelectedUserId(null)}
        onDeleted={handleStoryDeleted}
        onCreateStory={() => setOpenStory(true)}
      />
      <CreateSearchModal
          open={openSearch}
          onClose={() => setOpenSearch(false)}
      />
    </>
  );
}

