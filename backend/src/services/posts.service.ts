import { uploadPostMedia } from "./cloudinaryPostUpload";
import { createPostRepo, getUserPostsRepo } from "../repositories/posts.repository";

export const createPostService = async (
  input: {
    user: string;
    caption: string;
    mediaUrl: string;
    mediaType: "image" | "video";
  },
  ctx: { files?: any }
) => {
  // If files were uploaded, upload them to Cloudinary and use the first one
  if (ctx.files?.length) {
    const uploadedMedia = await uploadPostMedia(ctx.files);
    const first = uploadedMedia[0];
    const post = await createPostRepo({
      user: input.user,
      caption: input.caption ?? "",
      mediaUrl: first.url,
      mediaType: first.type,
    });
    return post;
  }

  // Otherwise use the provided mediaUrl/mediaType
  const post = await createPostRepo({
    user: input.user,
    caption: input.caption ?? "",
    mediaUrl: input.mediaUrl,
    mediaType: input.mediaType,
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

