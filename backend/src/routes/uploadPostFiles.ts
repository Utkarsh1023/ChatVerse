import multer from "multer";

// We'll use memory storage.
const upload = multer({ storage: multer.memoryStorage() });

// Accept mixed images/videos. Frontend should send field name "media".
// Use small limits; production should be configured via env.
export const uploadPost = upload.array("media", 10);

