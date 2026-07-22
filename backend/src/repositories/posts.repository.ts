import Post from "../models/Post";
import User from "../models/User";

export const createPostRepo = async (input: {
  user: string;
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
}) => {
  return await Post.create({
    user: input.user,
    caption: input.caption,
    mediaUrl: input.mediaUrl,
    mediaType: input.mediaType,
  });
};

export const getUserPostsRepo = async (params: {
  username: string;
  cursor?: string;
  limit: number;
}) => {
  const user = await User.findOne({ username: params.username }).select("_id");
  if (!user) return { items: [], nextCursor: null as string | null };

  const q: any = {
    user: user._id
  }

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

