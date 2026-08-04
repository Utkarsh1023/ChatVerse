import PostCard from "../Feeds/PostCard";

export interface FeedMedia {
  url: string;
  public_id: string;
  type: "image" | "video" | "raw" | "audio";
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  thumbnailUrl?: string;
}

export interface FeedPost {
  _id: string;
  author:
    | string
    | {
        _id: string;
        name: string;
        username: string;
        avatar: string;
      };
  caption: string;
  media: FeedMedia[];
  tags?: string[];
  location?: string;
  privacy?: string;
  likes: string[];
  likesCount?: number;
  comments: string[];
  commentsCount?: number;
  sharesCount?: number;
  savedCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
  updatedAt?: string;
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
      <div className="mx-auto max-w-3xl py-2">
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
    <div className="mx-auto max-w-3xl py-2">
      {posts.map((post) => {
        // Normalize author (backend may send `author` as object or string id).
        const author =
          typeof post.author === "object" && post.author !== null
            ? post.author
            : {
                _id: post.author as string,
                name: "User",
                username: "user",
                avatar: "https://ui-avatars.com/api/?background=random",
              };

        // Normalize media (new schema: array). Fall back to a single-item array.
        const media =
          Array.isArray(post.media) && post.media.length > 0
            ? post.media
            : [];

        const likesCount =
          post.likesCount ?? post.likes?.length ?? 0;

        return (
          <PostCard
            key={post._id}
            postId={post._id}
            user={author.name}
            username={author.username}
            avatar={author.avatar}
            media={media}
            caption={post.caption}
            likesCount={likesCount}
            initialLiked={post.isLiked ?? false}
            comments={post.commentsCount ?? post.comments?.length ?? 0}
            time={new Date(post.createdAt).toLocaleDateString()}
          />
        );
      })}
    </div>
  );
}

