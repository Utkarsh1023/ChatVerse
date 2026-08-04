import API from "./axios"; // your configured axios instance
import type { StoryGroup, StoryItem, StoryUser } from "../types/story";

/**
 * Build a working URL for a backend media path. The backend stores local
 * files as `/uploads/...` and remote (Cloudinary) URLs as absolute http(s)
 * strings — this helper handles both.
 */
const API_BASE =
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
    "/api",
    ""
  );

export const resolveMediaUrl = (url?: string) => {
  if (!url) return "";

  if (url.startsWith("http")) return url;

  return `${API_BASE}${url}`;
};

/** POST /stories — upload a new story (creates a doc under the SAME user). */
export const uploadStory = async (file: File, caption: string) => {
  const formData = new FormData();

  formData.append("media", file);
  formData.append("caption", caption);

  const { data } = await API.post("/stories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

/** GET /stories — returns GROUPS: one per user, own group first. */
export const getStories = async (): Promise<StoryGroup[]> => {
  const { data } = await API.get("/stories");
  return data.stories ?? [];
};

/** GET /stories/:userId — a single user's stories (chronological). */
export const getUserStories = async (userId: string): Promise<StoryItem[]> => {
  const { data } = await API.get(`/stories/${userId}`);
  return data.stories ?? [];
};

/** DELETE /stories/:storyId — owner-only delete. */
export const deleteStory = async (storyId: string) => {
  const { data } = await API.delete(`/stories/${storyId}`);
  return data;
};

/** Normalize a raw story document into a StoryItem. */
export const normalizeStory = (story: any): StoryItem => ({
  _id: story._id,
  user: story.user,
  media: story.media,
  type: story.type,
  caption: story.caption,
  createdAt: story.createdAt,
  expiresAt: story.expiresAt,
});

/** Normalize a raw user into StoryUser. */
export const normalizeStoryUser = (user: any): StoryUser => ({
  _id: user._id || user.id,
  name: user.name || "Unknown",
  username: user.username,
  avatar: user.avatar || user.profilePicture || "",
});

