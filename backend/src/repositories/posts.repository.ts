import Post from "../models/Post";
import User from "../models/User";
import type { IMention, Visibility } from "../models/Post";

export type CreatePostInput = {
  authorId: string;
  caption: string;
  visibility: Visibility;
  location?: string;
  hashtags?: string[];
  mentions?: IMention[];
  media: Array<{
    url: string;
    publicId: string;
    type: "image" | "video";
    width?: number;
    height?: number;
  }>;
};

export const createPostRepo = async (input: CreatePostInput) => {
  const post = await Post.create({
    author: input.authorId,
    caption: input.caption,
    visibility: input.visibility,
    location: input.location ?? "",
    hashtags: input.hashtags ?? [],
    mentions: input.mentions ?? [],
    media: input.media,
  });

  return post;
};

export const getUserPostsRepo = async (params: {
  username: string;
  cursor?: string;
  limit: number;
}) => {
  const user = await User.findOne({ username: params.username }).select("_id");
  if (!user) return { items: [], nextCursor: null as string | null };

  const q: any = { author: user._id };

  // Cursor pagination by createdAt + _id (encode as createdAt|id)
  if (params.cursor) {
    const [createdAtStr, id] = params.cursor.split("|");
    const createdAt = new Date(createdAtStr);
    q.$or = [
      { createdAt: { $lt: createdAt } },
      { createdAt: createdAt, _id: { $lt: id } },
    ];
  }

  const items = await Post.find(q)
    .sort({ createdAt: -1, _id: -1 })
    .limit(params.limit)
    .lean();

  const last = items[items.length - 1];
  const nextCursor = last
    ? `${new Date(last.createdAt).toISOString()}|${last._id.toString()}`
    : null;

  return { items, nextCursor };
};

