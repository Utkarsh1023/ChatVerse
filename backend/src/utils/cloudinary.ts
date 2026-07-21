import { v2 as cloudinary } from "cloudinary";

// Cloudinary must be configured with env vars.
// Required:
//  - CLOUDINARY_CLOUD_NAME
//  - CLOUDINARY_API_KEY
//  - CLOUDINARY_API_SECRET
//
// If any are missing, Cloudinary will still initialize but upload will fail with
// a runtime error (which will surface as 500 from the upload endpoint).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

