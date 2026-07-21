import { Request, Response } from "express";
import { getAuthUserId } from "../utils/ensureAuthenticatedUser";
import { uploadPostMedia } from "../services/cloudinaryPostUpload";
import { createPostBodySchema } from "../validators/posts.validators";

/**
 * Flow: POST /api/upload/post (multipart/form-data)
 * - field name: "media" (array of image/video)
 * - body fields (optional): caption, visibility, location, hashtags, mentions
 *
 * Returns uploaded media so frontend can call POST /api/posts next.
 */
export const uploadPost = async (req: Request, res: Response) => {
  // Ensure authenticated user (used for future authorization/ownership checks)
  const _userId = getAuthUserId(req);

  const files = (req as any).files as Express.Multer.File[] | undefined;
  const uploaded = await uploadPostMedia(files ?? []);

  // Optional: validate non-file fields early if provided
  // (Doesn't create post; just helps catch obvious client errors.)
  const maybeCaption = req.body.caption;
  const maybeVisibility = req.body.visibility;

  if (maybeCaption !== undefined || maybeVisibility !== undefined) {
    // Use schema only when client sends these fields
    createPostBodySchema.parse({
      caption: req.body.caption,
      visibility: req.body.visibility,
      location: req.body.location,
      hashtags: req.body.hashtags
        ? JSON.parse(req.body.hashtags as string)
        : undefined,
      mentions: req.body.mentions
        ? JSON.parse(req.body.mentions as string)
        : undefined,
      // media is required by schema; provide from uploaded output
      media: JSON.parse(req.body.media ?? "[]"),
    } as any);
  }

  return res.status(201).json({
    success: true,
    media: uploaded,
  });
};
