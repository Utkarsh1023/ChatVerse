import { z } from "zod";

export const createPostBodySchema = z.object({
  caption: z.string().max(2000).optional().default(""),
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

