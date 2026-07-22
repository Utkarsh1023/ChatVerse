import { Request, Response } from "express";
import { getAuthUserId } from "../utils/ensureAuthenticatedUser";
import { uploadPostMedia } from "../services/cloudinaryPostUpload";
import { createPostBodySchema } from "../validators/posts.validators";

/**
 * Flow: POST /api/upload/post (multipart/form-data)
 * - field name: "media" (array of image/video)
 * - body fields (optional): caption
 *
 * Returns uploaded media info so frontend can call POST /api/posts next.
 */
export const uploadPost = async (req: Request, res: Response) => {
  // Ensure authenticated user (used for future authorization/ownership checks)
  const _userId = getAuthUserId(req);

  const files = (req as any).files as Express.Multer.File[] | undefined;
  const uploaded = await uploadPostMedia(files ?? []);

  // Validate caption if provided
  if (req.body.caption !== undefined) {
    createPostBodySchema.parse({ caption: req.body.caption });
  }

  return res.status(201).json({
    success: true,
    media: uploaded,
  });
};
