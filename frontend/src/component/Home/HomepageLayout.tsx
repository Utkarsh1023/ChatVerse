import { useState, useEffect } from "react";
import { getPosts } from "../../api/postApi";
import Sidebar from "../layouts/Sidebar";
import HomeHeader from "./HomeHeader";
// import CreatePost from "./CreatePost";
import StoryBar from "./StoryBar";
import Feed from "./Feed";
import RightPanel from "./RightPanel";
import CreatePostModal from "../CreatePostModel";
import CreateStoryModal from "../CreateStoryModel";
import StoryViewerModal from "../StoryViewerModal"
import type { Story } from "../StoryViewerModal";


export default function HomePage() {
  const [openPost, setOpenPost] = useState(false);
  const [openStory, setOpenStory] = useState(false);

  const initialStories: Story[] = [
  {
    id: 1,
    name: "Your Story",
    avatar: "https://i.pravatar.cc/150?img=12",
    isMine: true,
  },
  {
    id: 2,
    name: "Prachi",
    avatar: "https://i.pravatar.cc/150?img=32",
    media: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
    type: "image",
  },
];
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);  
  const [posts, setPosts] = useState([]);
  const fetchPosts = async () => {
    try {
      const res = await getPosts();
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, []);
  return (
    <>
      {/* Home */}
      <div className="min-h-screen bg-slate-950 p-2">
        <div className="mx-auto h-[calc(100vh-24px)] max-w-full overflow-hidden">

          <div className="flex h-full gap-2 overflow-hidden rounded-3xl bg-slate-900/70 backdrop-blur-xl">
            {/* Sidebar */}
            <div className="hidden shrink-0 lg:block">
              <Sidebar />
            </div>

            {/* Main */}
            <div className="flex min-w-0 flex-1">

              {/* Feed */}
              <div className="ml-2 min-w-0 flex-1">

                <div className="flex h-full flex-col rounded-3xl bg-slate-900/70">

                  <HomeHeader
                    onCreatePost={() => setOpenPost(true)}
                  />

                  <div className="flex-1 overflow-y-auto p-6">

                    {/* <CreatePost /> */}

                    <StoryBar
                      stories={stories}
                      onCreateStory={() => setOpenStory(true)}
                      onOpenStory={(story) => setSelectedStory(story)}
                    />

                    <Feed posts={posts} />

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
          onUpload={(story) => {
          setStories((prev) =>
            prev.map((s) =>
              s.isMine
                ? {
                    ...s,
                    media: story.media,
                    type: story.type,
                    createdAt: story.createdAt,
                  }
                : s
            )
          );
              setOpenStory(false);
          }}
      />
      
      <StoryViewerModal
        open={selectedStory !== null}
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
      />
    </>
  );
}