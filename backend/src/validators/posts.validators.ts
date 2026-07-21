import { z } from "zod";

export const visibilityEnum = z.enum(["Public", "Friends", "Private"]);

export const createPostBodySchema = z.object({
  caption: z.string().max(2000).optional().default(""),
  visibility: visibilityEnum.optional().default("Public"),
  location: z.string().max(200).optional().default(""),
  hashtags: z.array(z.string().min(1).max(50)).optional().default([]),
  mentions: z
    .array(
      z.object({
        username: z.string().min(1).max(30),
      })
    )
    .optional()
    .default([]),

  // media metadata is expected after upload step, but in our endpoint we accept
  // an array of Cloudinary publicIds/urls.
  // Frontend can also just omit and send files.
  media: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().min(1),
        type: z.enum(["image", "video"]),
        width: z.number().optional(),
        height: z.number().optional(),
      })
    )
    .optional()
    .default([]),

  // Mixed images/videos upload will be validated by upload middleware.
});

export const createCommentSchema = z.object({
  text: z.string().min(1).max(1000),
});

export const replyCommentSchema = z.object({
  parentCommentId: z.string().min(1),
  text: z.string().min(1).max(1000),
});

export const editCommentSchema = z.object({
  text: z.string().min(1).max(1000),
});

