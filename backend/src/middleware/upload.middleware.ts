import multer from "multer";
import path from "path";
import fs from "fs";

// Multer's diskStorage writes to "uploads/" — create the directory
// automatically on startup so the first upload doesn't crash with ENOENT.
const UPLOAD_DIR = "uploads";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Post media storage (default export) — images + videos up to 50 MB.
// ---------------------------------------------------------------------------

// Allowed media types (images + videos for an Instagram-like app).
const ALLOWED_MIME_TYPES = new Set<string>([
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
]);

// 50 MB limit for videos/images — Cloudinary's upload limit is higher, but
// buffering the whole file on disk and sending it is fine at this size.
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },

  filename(req, file, cb) {
    // Avoid path traversal + collisions: timestamp + safe extension.
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const isValid = ALLOWED_MIME_TYPES.has(file.mimetype);

  if (isValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only jpg, jpeg, png, webp, gif, avif, mp4, webm and mov files are allowed"
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

export default upload;

// ---------------------------------------------------------------------------
// Profile image uploader — images ONLY (avatar / cover), 5 MB cap.
// ---------------------------------------------------------------------------

// Only images are valid for avatars and covers.
const IMAGE_MIME_TYPES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const PROFILE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const profileImageFilter: multer.Options["fileFilter"] = (
  req,
  file,
  cb
) => {
  const extOk = /\.(jpe?g|png|webp)$/i.test(file.originalname);
  const mimeOk = IMAGE_MIME_TYPES.has(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, jpeg, png and webp images are allowed"));
  }
};

export const uploadProfileImage = multer({
  storage,
  fileFilter: profileImageFilter,
  limits: {
    fileSize: PROFILE_MAX_SIZE,
    files: 1,
  },
});

// ---------------------------------------------------------------------------
// Chat file uploader — images, videos and common documents up to 50 MB.
// Used by POST /api/messages/upload to attach files to chat messages.
// ---------------------------------------------------------------------------

const CHAT_MIME_TYPES = new Set<string>([
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "image/heic",
  "image/heif",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/mp4",
  "audio/x-m4a",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/json",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/octet-stream",
]);

const CHAT_MAX_SIZE = 50 * 1024 * 1024; // 50 MB

const chatFileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (CHAT_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "This file type is not supported. Allowed: images, videos, audio, PDF, docs, spreadsheets, presentations, zip and text files."
      )
    );
  }
};

export const uploadChatFile = multer({
  storage,
  fileFilter: chatFileFilter,
  limits: {
    fileSize: CHAT_MAX_SIZE,
    files: 1,
  },
});

