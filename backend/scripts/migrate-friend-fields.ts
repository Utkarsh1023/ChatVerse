// One-time migration: backfill `friends`, `followers`, `following`,
// `friendRequests`, and `sentRequests` arrays on existing users who were
// created BEFORE these fields existed in the schema (or whose documents are
// missing them for any reason).
//
// The schema already defaults new documents to [], but existing documents in
// MongoDB keep whatever shape they were saved with — if a user was created
// before these fields existed, `.friends` would be `undefined` and any push
// would throw `TypeError: Cannot read properties of undefined`.
//
// Run from backend/:
//   npx tsx scripts/migrate-friend-fields.ts

import "../src/config/env";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

async function main() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in backend/.env");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected.");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("❌ Could not access connection.db");
    await mongoose.disconnect();
    process.exit(1);
  }

  const users = db.collection("users");

  // 1) Count how many documents are missing each field.
  const missingFriends = await users.countDocuments({
    friends: { $exists: false },
  });
  const missingFollowers = await users.countDocuments({
    followers: { $exists: false },
  });
  const missingFollowing = await users.countDocuments({
    following: { $exists: false },
  });
  const missingFriendRequests = await users.countDocuments({
    friendRequests: { $exists: false },
  });
  const missingSentRequests = await users.countDocuments({
    sentRequests: { $exists: false },
  });

  console.log(`📊 Users missing 'friends'           : ${missingFriends}`);
  console.log(`📊 Users missing 'followers'         : ${missingFollowers}`);
  console.log(`📊 Users missing 'following'         : ${missingFollowing}`);
  console.log(`📊 Users missing 'friendRequests'    : ${missingFriendRequests}`);
  console.log(`📊 Users missing 'sentRequests'      : ${missingSentRequests}`);

  if (
    missingFriends === 0 &&
    missingFollowers === 0 &&
    missingFollowing === 0 &&
    missingFriendRequests === 0 &&
    missingSentRequests === 0
  ) {
    console.log("✅ No migration needed — all users already have the fields.");
    await mongoose.disconnect();
    return;
  }

  // 2) Apply the fix with a single multi-doc update.
  const result = await users.updateMany(
    {
      $or: [
        { friends: { $exists: false } },
        { followers: { $exists: false } },
        { following: { $exists: false } },
        { friendRequests: { $exists: false } },
        { sentRequests: { $exists: false } },
      ],
    },
    {
      $set: {
        friends: [],
        followers: [],
        following: [],
        friendRequests: [],
        sentRequests: [],
      },
    }
  );

  console.log(`✅ Updated ${result.modifiedCount} user document(s).`);

  await mongoose.disconnect();
  console.log("👋 Done. You can delete this script after running it.");
}

main().catch(async (err) => {
  console.error("❌ Migration failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});

