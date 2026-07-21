import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(__dirname, "../../uploads/posts");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },

  filename(req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

export const uploadPost = multer({
  storage,

  fileFilter(req, file, cb) {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed."));
    }
  },

  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

// Avatar upload uses memory storage so controller can read req.file.buffer for base64
const avatarStorage = multer.memoryStorage();

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed for avatar."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
