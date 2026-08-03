# Profile Management Backend — Complete Guide

Production-quality Profile Management module for the MERN real-time chat app.

- **Stack:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Multer, Cloudinary, express-validator
- **Architecture:** MVC (controllers → services → models) with clean separation of concerns
- **API base:** `http://localhost:5000/api/profile`

---

## 1. Folder Structure

```
src/
│
├── controllers/
│     profile.controller.ts      → thin HTTP layer (asyncHandler + ApiResponse)
│
├── services/
│     profile.service.ts         → business logic (profile CRUD, image swap, stats)
│     cloudinary.service.ts      → Cloudinary upload/delete helpers (reusable)
│
├── routes/
│     profile.routes.ts          → 7 authenticated endpoints
│
├── middleware/
│     auth.middleware.ts         → legacy `protect` (kept for auth routes)
│     verifyToken.ts             → JWT verification (`verifyToken` used here)
│     upload.middleware.ts       → Multer storage + `uploadProfileImage` (images, 5MB)
│     error.middleware.ts        → centralized error handler (incl. MulterError)
│     validate.ts                → Zod validator middleware (used by auth)
│
├── models/
│     User.ts                    → full profile schema + `fullName` virtual
│
├── validators/
│     profile.validator.ts       → express-validator chains
│
├── utils/
│     ApiResponse.ts             → consistent success envelope
│     ApiError.ts                → consistent error class
│     asyncHandler.ts            → typed async wrapper
│
└── server.ts
```

---

## 2. User Model (`src/models/User.ts`)

The model now includes every field the React frontend expects.

| Field          | Type               | Default                                   | Notes                                |
| -------------- | ------------------ | ----------------------------------------- | ------------------------------------ |
| `name`         | String (required)  | —                                         | trimmed                              |
| `username`     | String (unique)    | —                                         | lowercase + trimmed                  |
| `email`        | String (unique)    | —                                         | lowercase + trimmed                  |
| `password`     | String (select:no) | —                                         | bcrypt-hashed (12 rounds)            |
| `avatar`       | String             | `https://ui-avatars.com/api/?background=random` | Cloudinary secure_url          |
| `coverImage`   | String             | `""`                                      | Cloudinary secure_url                |
| `bio`          | String             | `""` (max 300)                            | trimmed                              |
| `country`      | String             | `""`                                      | trimmed                              |
| `location`     | String             | `""`                                      | legacy alias                         |
| `friends`      | ObjectId[] → User  | `[]`                                      | populated in profile responses       |
| `followers`    | ObjectId[] → User  | `[]`                                      | populated in profile responses       |
| `following`    | ObjectId[] → User  | `[]`                                      | populated in profile responses       |
| `posts`        | ObjectId[] → Post  | `[]`                                      | count used by `/stats`               |
| `friendRequests`| ObjectId[] → User | `[]`                                      | friend module                        |
| `sentRequests` | ObjectId[] → User  | `[]`                                      | friend module                        |
| `refreshToken` | String (select:no) | `""`                                      | auth module                          |
| `isOnline`     | Boolean            | `false`                                   | socket status                        |
| `isVerified`   | Boolean            | `false`                                   |                                     |
| `lastSeen`     | Date               | —                                         |                                     |
| `socketId`     | String             | —                                         |                                     |

**`fullName` virtual** — the React frontend reads `user.fullName` while the DB column is `name`:

```ts
userSchema.virtual("fullName").get(function (this: IUser) {
  return this.name;
});
userSchema.virtual("fullName").set(function (this: IUser, value: string) {
  this.name = value;
});
```

**JSON serialization** strips `password`, `refreshToken`, `__v` and enables virtuals automatically on every `res.json(...)`:

```ts
toJSON: {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const safe = ret as Record<string, unknown>;
    delete safe.password;
    delete safe.refreshToken;
    return safe;
  },
}
```

---

## 3. Controllers (`src/controllers/profile.controller.ts`)

All controllers are wrapped with `asyncHandler` and return `ApiResponse`.

| Controller        | Route                  | HTTP   | Purpose                              |
| ----------------- | ---------------------- | ------ | ------------------------------------ |
| `getMyProfile`    | `/api/profile/me`      | GET    | Full profile + populated social graph |
| `updateProfile`   | `/api/profile`         | PUT    | Update fullName/username/bio/country |
| `uploadAvatar`    | `/api/profile/avatar`  | PUT    | Multer → Cloudinary → save URL       |
| `uploadCover`     | `/api/profile/cover`   | PUT    | Same as avatar                       |
| `deleteAvatar`    | `/api/profile/avatar`  | DELETE | Remove avatar from Cloudinary        |
| `deleteCover`     | `/api/profile/cover`   | DELETE | Remove cover from Cloudinary         |
| `getProfileStats` | `/api/profile/stats`   | GET    | Real counts from MongoDB             |

The authenticated user id is resolved with a small helper that supports both
`req.user.id` (new convention) and `req.userId` (legacy):

```ts
const getUserId = (req: AuthRequest): string => {
  const id = req.user?.id || req.userId;
  if (!id) throw new ApiError(401, "Unauthorized");
  return id;
};
```

---

## 4. Services (`src/services/profile.service.ts`)

All business logic lives here so controllers stay thin.

### `getMyProfileService(userId)`
Fetches the user, excludes `password`/`refreshToken`, populates `friends`,
`followers`, `following` with safe fields.

### `updateProfileService(userId, input)`
- Trims every value.
- Username uniqueness check: `User.findOne({ username, _id: { $ne: user._id } })`
  → `409` if taken.
- Persists `name` (via `fullName`), `username`, `bio`, `country`.
- Re-fetches with populated social graph for a consistent response shape.

### `updateAvatarService` / `updateCoverService`
Both delegate to `updateProfileImage(userId, file, "avatar" | "coverImage")`:
1. Upload the **new** image to Cloudinary **first** (user never loses their
   image if Cloudinary is down).
2. Capture the old URL **before** overwriting the field.
3. Save the new `secure_url` in MongoDB.
4. Best-effort delete of the old Cloudinary asset (`deleteImageFromUrl`).
5. Best-effort cleanup of the multer temp file.

### `deleteAvatarService` / `deleteCoverService`
Reset the field (avatar → default placeholder, cover → `""`) and best-effort
delete the old Cloudinary asset.

### `getProfileStatsService(userId)`
Real MongoDB counts:

```ts
const [user, postsCount] = await Promise.all([
  User.findById(userId).select("friends followers following"),
  Post.countDocuments({ author: userId }),
]);

return {
  friends: user.friends?.length ?? 0,
  followers: user.followers?.length ?? 0,
  following: user.following?.length ?? 0,
  posts: postsCount,   // from the Post collection, not the posts array
};
```

---

## 5. Cloudinary Service (`src/services/cloudinary.service.ts`)

Reusable, typed Cloudinary helpers:

- `uploadImage(filePath, folder, resourceType)` → `CloudinaryUploadResult`
  - applies `transformation: [{ quality: "auto", fetch_format: "auto" }]`
  - throws `ApiError(502, ...)` on failure
- `uploadAvatarImage(filePath)` → folder `uchat/profiles/avatars`
- `uploadCoverImage(filePath)` → folder `uchat/profiles/covers`
- `deleteImage(publicId)` → destroys by public_id (idempotent)
- `deleteImageFromUrl(url)` → extracts public_id from a `res.cloudinary.com` URL and deletes it; **safe no-op** for non-Cloudinary URLs (e.g. the `ui-avatars.com` default)
- `extractPublicIdFromUrl(url)` / `isCloudinaryUrl(url)` → URL parsing helpers

```ts
export const uploadAvatarImage = async (filePath: string) =>
  uploadImage(filePath, PROFILE_AVATAR_FOLDER, "image");
```

---

## 6. Routes (`src/routes/profile.routes.ts`)

```ts
router.use(verifyToken); // every route requires a valid JWT

router.get("/me", getMyProfile);
router.put("/", updateProfileValidators, validateRequest, updateProfile);
router.put("/avatar", uploadProfileImage.single("avatar"), handleMulterError, uploadAvatar);
router.put("/cover", uploadProfileImage.single("cover"), handleMulterError, uploadCover);
router.delete("/avatar", deleteAvatar);
router.delete("/cover", deleteCover);
router.get("/stats", getProfileStats);
```

Multer errors are mapped to clean `400`s by `handleMulterError`.

---

## 7. Validation (`src/validators/profile.validator.ts`)

Uses **express-validator** (installed as `express-validator@^7.3.2`).

| Chain                | Rules                                                        |
| -------------------- | ------------------------------------------------------------ |
| `validateFullName`   | optional, trim, not empty, 2–50 chars                        |
| `validateUsername`   | optional, trim, 3–30 chars, `/^[a-zA-Z0-9_]+$/`              |
| `validateBio`        | optional, trim, max 300 chars                                |
| `validateCountry`    | optional, trim, max 100 chars                                |

`validateRequest` reads `validationResult(req)` and throws the first error as an
`ApiError(400, first.msg, errors.array())` — handled by the global error handler.

---

## 8. Multer Middleware (`src/middleware/upload.middleware.ts`)

Two exporters:

- **`upload` (default)** — posts: images + videos, 50 MB.
- **`uploadProfileImage`** — avatars/covers: images only (`jpeg/png/webp/gif/avif`), **5 MB cap**, 1 file.

```ts
export const uploadProfileImage = multer({
  storage,                       // diskStorage → uploads/
  fileFilter: profileImageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
```

The `uploads/` directory is auto-created on startup.

---

## 9. Cloudinary Configuration (`src/config/cloudinary.ts`)

```ts
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
```

The module logs a warning at startup if any credential is missing. `env.ts` is
imported first in `server.ts` so `.env` is loaded before Cloudinary initializes.

---

## 10. Environment Variables

Add to `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/premium-chat

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Cloudinary (used by avatar/cover/post uploads)
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 11. Example Postman Requests

All requests need the header `Authorization: Bearer <accessToken>`.

### GET /api/profile/me
```
GET http://localhost:5000/api/profile/me
```
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile fetched successfully",
  "user": {
    "_id": "66123...",
    "name": "Utkarsh Anand",
    "fullName": "Utkarsh Anand",
    "username": "utkarsh",
    "email": "utkarsh@example.com",
    "avatar": "https://res.cloudinary.com/.../avatars/abc.jpg",
    "coverImage": "https://res.cloudinary.com/.../covers/xyz.jpg",
    "bio": "Full-stack developer",
    "country": "India",
    "friends": [ { "_id": "...", "name": "A", "username": "a", "avatar": "..." } ],
    "followers": [],
    "following": [],
    "posts": [],
    "isOnline": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### PUT /api/profile
```
PUT http://localhost:5000/api/profile
Content-Type: application/json

{
  "fullName": "Utkarsh Anand",
  "username": "utkarsh_dev",
  "bio": "MERN stack developer",
  "country": "India"
}
```
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "user": { "...": "updated user object" }
}
```

### PUT /api/profile/avatar
```
PUT http://localhost:5000/api/profile/avatar
Content-Type: multipart/form-data
body/form-data: avatar → (file)
```

### PUT /api/profile/cover
```
PUT http://localhost:5000/api/profile/cover
Content-Type: multipart/form-data
body/form-data: cover → (file)
```

### DELETE /api/profile/avatar
```
DELETE http://localhost:5000/api/profile/avatar
```

### DELETE /api/profile/cover
```
DELETE http://localhost:5000/api/profile/cover
```

### GET /api/profile/stats
```
GET http://localhost:5000/api/profile/stats
```
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile stats fetched successfully",
  "stats": {
    "friends": 12,
    "followers": 245,
    "following": 18,
    "posts": 7
  }
}
```

---

## 12. React Frontend Integration

### Typed API module — `frontend/src/api/profile.ts`

```ts
import API from "./axios";

export const getProfile = async (): Promise<UserProfile> => {
  const res = await API.get<ProfileResponse>("/profile/me");
  return res.data.user;
};

export const updateProfile = async (
  data: Partial<Pick<UserProfile, "fullName" | "username" | "bio" | "country">>
): Promise<UserProfile> => {
  const res = await API.put<ProfileResponse>("/profile", data);
  return res.data.user;
};

export const updateAvatar = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await API.put<ProfileResponse>("/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.user;
};

export const updateCover = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append("cover", file);
  const res = await API.put<ProfileResponse>("/profile/cover", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.user;
};

export const deleteAvatar = async (): Promise<UserProfile> => {
  const res = await API.delete<ProfileResponse>("/profile/avatar");
  return res.data.user;
};

export const deleteCover = async (): Promise<UserProfile> => {
  const res = await API.delete<ProfileResponse>("/profile/cover");
  return res.data.user;
};

export const getProfileStats = async (): Promise<StatsResponse["stats"]> => {
  const res = await API.get<StatsResponse>("/profile/stats");
  return res.data.stats;
};
```

### ProfileHeader / AuthContext compatibility

`ProfileHeader.tsx` reads:

```tsx
const displayName = user?.fullName || "";
const username   = user?.username || "";
const location   = user?.country || "";
const bio        = user?.bio || "";
const avatarSrc  = user?.avatar || "";
// cover image
<img src={user?.coverImage || "/default-cover.jpg"} />
```

`AuthContext` normalizes `id`/`_id` and keeps the whole object, so after login
or `/auth/me` every profile field is available on `user`.

### Example component usage

```tsx
import { useEffect, useState } from "react";
import { getProfile, updateProfile, updateAvatar } from "../api/profile";

function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getProfile().then(setUser);
  }, []);

  const handleSave = async () => {
    const updated = await updateProfile({
      fullName: "New Name",
      bio: "Hello!",
      country: "India",
    });
    setUser(updated);
  };

  const handleAvatar = async (file: File) => {
    const updated = await updateAvatar(file);
    setUser(updated);
  };

  return <div>{user?.fullName} — @{user?.username}</div>;
}
```

### Notes
- The backend returns `user.fullName` (virtual over `name`), `user.coverImage`,
  `user.bio`, `user.country`, and the arrays `user.friends`, `user.followers`,
  `user.following`, `user.posts` — all populated/count-backed.
- The 401 interceptor in `frontend/src/api/axios.ts` automatically refreshes the
  access token, so profile calls just work after login.
- The legacy helpers in `frontend/src/api/axios.ts` (`getProfile`, `updateProfile`,
  `updateProfileAvatar`) now point to `/profile/*` for `Settings.tsx` compatibility.

---

## 13. Verification

```bash
cd backend
npx tsc --noEmit          # type-check → expect no errors
npm run dev               # start server
# optional: backfill social fields on existing docs
npx tsx scripts/migrate-friend-fields.ts
```

Health check: `GET http://localhost:5000/health`

