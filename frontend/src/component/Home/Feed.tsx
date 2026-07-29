import PostCard from "../Feeds/PostCard";

export interface FeedPost {
  _id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  likes: string[];
  comments: any[];
  createdAt: string;
  isLiked: boolean;
}

interface FeedProps {
  posts: FeedPost[];
  error?: string | null;
  loading?: boolean;
}

export default function Feed({ posts, error, loading }: FeedProps) {
  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-fuchsia-500"></div>
            <p className="text-slate-400">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-8 py-6 text-center">
            <p className="text-lg text-red-400">⚠️</p>
            <p className="text-slate-300">{error}</p>
            <p className="text-sm text-slate-500">Sign in to view posts.</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl py-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg text-slate-400">No posts yet</p>
            <p className="text-sm text-slate-500">Be the first to share something!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          postId={post._id}
          user={post.user.name}
          username={post.user.username}
          avatar={post.user.avatar}
          image={`http://localhost:5000${post.mediaUrl}`}
          caption={post.caption}
          likesCount={post.likes.length}
          initialLiked={post.isLiked}
          comments={post.comments.length}
          time={new Date(post.createdAt).toLocaleDateString()}
        />
      ))}
    </div>
  );
}
