import type { UploadedMedia } from "../services/cloudinaryPostUpload";
import { uploadPostMedia } from "./cloudinaryPostUpload";
import type { IMention, Visibility } from "../models/Post";
import { createPostRepo, getUserPostsRepo } from "../repositories/posts.repository";

export const createPostService = async (
  input: {
    authorId: string;
    caption: string;
    visibility: Visibility;
    location?: string;
    hashtags?: string[];
    mentions?: IMention[];
    media: UploadedMedia[];
  },
  ctx: { files?: any }
) => {
  const uploadedMedia: UploadedMedia[] = ctx.files?.length
    ? await uploadPostMedia(ctx.files)
    : input.media;

  const post = await createPostRepo({
    authorId: input.authorId,
    caption: input.caption ?? "",
    visibility: input.visibility,
    location: input.location,
    hashtags: input.hashtags,
    mentions: input.mentions,
    media: uploadedMedia,
  });

  return post;
};

export const getUserPostsService = async (params: {
  username: string;
  cursor?: string;
  limit?: number;
}) => {
  const limit = Math.min(Math.max(params.limit ?? 10, 1), 50);
  const result = await getUserPostsRepo({
    username: params.username,
    cursor: params.cursor,
    limit,
  });


  // TODO: add aggregation response mapping to match frontend
  return result;
};

