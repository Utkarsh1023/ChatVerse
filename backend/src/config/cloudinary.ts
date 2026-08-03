import { v2 as cloudinary } from "cloudinary";

console.log("[cloudinary] CLOUD_NAME present:", !!process.env.CLOUD_NAME);
console.log("[cloudinary] API_KEY present:", !!process.env.API_KEY);
console.log("[cloudinary] API_SECRET present:", !!process.env.API_SECRET);
console.log("[cloudinary] cwd:", process.cwd());

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// Startup diagnostic — a missing credential makes every upload fail with a
// 500 in the post controller. Surface it immediately instead of discovering
// it at runtime.
if (
    !process.env.CLOUD_NAME ||
    !process.env.API_KEY ||
    !process.env.API_SECRET
) {
    console.warn(
        "⚠️ Cloudinary is NOT fully configured. Set CLOUD_NAME, API_KEY and " +
        "API_SECRET in backend/.env (used for post media uploads)."
    );
} else {
    console.log("🟢 Cloudinary configured");
}

export default cloudinary;
