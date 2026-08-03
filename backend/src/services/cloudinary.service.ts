import cloudinary from "../config/cloudinary";
import ApiError from "../utils/ApiError";

const PROFILE_AVATAR_FOLDER = "uchat/profiles/avatars";
const PROFILE_COVER_FOLDER = "uchat/profiles/covers";

/** Result shape returned by Cloudinary for an image upload. */
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  created_at?: string;
}

/**
 * Upload a local image file (multer temp path) to Cloudinary.
 *
 * @param filePath absolute/local path of the temp file (multer writes these)
 * @param folder   destination folder in the Cloudinary account
 * @param resourceType "image" (default) — set "video"/"raw" when needed
 */
export const uploadImage = async (
  filePath: string,
  folder: string = PROFILE_AVATAR_FOLDER,
  resourceType: "image" | "auto" = "image"
): Promise<CloudinaryUploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
      // Optimise avatars/covers for the web.
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Cloudinary error";
    throw new ApiError(502, "Image upload to Cloudinary failed", { message });
  }
};

/**
 * Upload a profile avatar directly (uses the avatar folder).
 */
export const uploadAvatarImage = async (filePath: string) =>
  uploadImage(filePath, PROFILE_AVATAR_FOLDER, "image");

/**
 * Upload a profile cover directly (uses the cover folder).
 */
export const uploadCoverImage = async (filePath: string) =>
  uploadImage(filePath, PROFILE_COVER_FOLDER, "image");

/**
 * Delete a Cloudinary asset by its public_id.
 * Non-existent assets resolve silently (Cloudinary is idempotent here).
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.warn("⚠️ Cloudinary delete failed for", publicId, error);
  }
};

/**
 * Delete a Cloudinary asset from its full URL (used when removing an
 * avatar/cover that was previously uploaded). Safe no-op for non-Cloudinary
 * URLs (e.g. the default `ui-avatars.com` placeholder).
 */
export const deleteImageFromUrl = async (url?: string): Promise<void> => {
  if (!url || !isCloudinaryUrl(url)) return;

  const publicId = extractPublicIdFromUrl(url);
  if (publicId) {
    await deleteImage(publicId);
  }
};

/**
 * Extract the Cloudinary `public_id` from a secure_url.
 *
 * Example:
 *   https://res.cloudinary.com/cloud-name/image/upload/v1234/uchat/profiles/avatars/abc123.jpg
 *   → uchats/profiles/avatars/abc123  (note: folder + filename WITHOUT extension)
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/");

    // /cloud_name/image/upload/v{version}/<folder>/<public_id>.<ext>
    const uploadIdx = segments.indexOf("upload");
    if (uploadIdx === -1 || segments.length <= uploadIdx + 2) return null;

    const rest = segments.slice(uploadIdx + 1);
    // Drop the version segment (starts with "v" followed by digits).
    if (rest.length > 0 && /^v\d+$/.test(rest[0])) {
      rest.shift();
    }

    if (rest.length === 0) return null;

    // Remove file extension from the final segment.
    const last = rest[rest.length - 1];
    const dot = last.lastIndexOf(".");
    if (dot > 0) {
      rest[rest.length - 1] = last.slice(0, dot);
    }

    return rest.join("/");
  } catch {
    return null;
  }
};

/**
 * True when the URL is hosted on Cloudinary (res.cloudinary.com).
 */
export const isCloudinaryUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);
    return hostname === "res.cloudinary.com" || hostname.endsWith(".cloudinary.com");
  } catch {
    return false;
  }
};

