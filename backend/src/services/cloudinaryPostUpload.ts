import path from "path";
import { v2 as cloudinary } from "cloudinary";
import type { Express } from "express";

// Typescript-friendly error/result types for upload_stream callback.
type UploadError = unknown;


export type UploadedMedia = {
  url: string;
  publicId: string;
  type: "image" | "video";
  width?: number;
  height?: number;
};

// Central helper used by upload controller.
export const uploadPostMedia = async (
  files: Express.Multer.File[]
): Promise<UploadedMedia[]> => {
  if (!files?.length) return [];

  // Cloudinary config is expected in backend/src/utils/cloudinary.ts
  // but this module uses it indirectly via import side-effects.

  const results: UploadedMedia[] = [];

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    const isVideo = file.mimetype.startsWith("video/") || [".mp4", ".mov", ".mkv"].includes(ext);

    const folder = "premium-chat/posts";

    const uploadResponse = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: isVideo ? "video" : "image",
            public_id: undefined,
          },
          (err: UploadError, res: any) => {
            if (err) return reject(err);
            resolve(res);
          }
        )
        .end(file.buffer);
    });

    results.push({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      type: isVideo ? "video" : "image",
      width: uploadResponse.width,
      height: uploadResponse.height,
    });
  }

  return results;
};

