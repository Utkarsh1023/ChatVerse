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
}

export default function Feed({ posts }: FeedProps) {
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
