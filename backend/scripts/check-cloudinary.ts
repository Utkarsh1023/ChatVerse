// Diagnostic: verify Cloudinary credentials AND the actual upload flow used by
// POST /api/posts/create. Dumps the FULL error object so we can see the exact
// reason Cloudinary rejects the upload (403).
//
// Run from backend/:
//   npx tsx scripts/check-cloudinary.ts

import "../src/config/env";
import "../src/config/cloudinary";
import { v2 as cloudinary } from "cloudinary";

const config = cloudinary.config();

console.log("Cloudinary config loaded from backend/.env:");
console.log("  cloud_name :", config.cloud_name ? `"${config.cloud_name}"` : "MISSING");
console.log(
  "  api_key    :",
  config.api_key ? `"${String(config.api_key).slice(0, 4)}****" (${String(config.api_key).length} chars)` : "MISSING"
);
console.log(
  "  api_secret :",
  config.api_secret ? `"****${String(config.api_secret).slice(-4)}" (${String(config.api_secret).length} chars)` : "MISSING"
);

// 1x1 transparent PNG (base64) — tiny, valid, uploads instantly.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

function dumpError(label: string, err: any) {
  console.log(`\n--- ${label} ---`);
  console.log("FULL error object:");
  console.dir(err, { depth: null });

  const message = err?.error?.message || err?.message || String(err);
  const httpCode = err?.http_code ?? err?.error?.http_code ?? "?";

  // Cloudinary often includes the real reason in err.error (the response body).
  if (err?.error && typeof err.error === "object" && message.includes("UnexpectedResponse")) {
    console.log("\nDecoded Cloudinary response body:");
    console.dir(err.error, { depth: null });
  }

  console.log("\nSummary:");
  console.log("  message  :", message);
  console.log("  http_code:", httpCode);
}

async function main() {
  // ---- 1) Ping (read op) ----
  try {
    const res = await cloudinary.api.ping();
    console.log("\n✅ 1) Cloudinary ping OK:", JSON.stringify(res));
  } catch (err: any) {
    dumpError("1) Ping FAILED (read op rejected → bad credentials)", err);
    return;
  }

  // ---- 2) Real upload (write op, same as the app) ----
  try {
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "uchat/posts" },
        (error, uploadResult) => (error ? reject(error) : resolve(uploadResult))
      );
      stream.end(TINY_PNG);
    });
    console.log("\n✅ 2) Test upload OK:");
    console.log("   public_id :", result.public_id);
    console.log("   secure_url:", result.secure_url);
    try {
      await cloudinary.uploader.destroy(result.public_id);
      console.log("   (test asset cleaned up)");
    } catch {
      console.log("   (note: could not auto-clean the test asset)");
    }
  } catch (err: any) {
    dumpError("2) Upload FAILED (write op rejected → account-level restriction)", err);
  }
}

main();

