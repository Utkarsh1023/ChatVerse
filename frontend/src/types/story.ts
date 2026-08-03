/**
 * Shared Story types — one user maps to exactly ONE story group/circle.
 */

export interface StoryUser {
  _id: string;
  name: string;
  username?: string;
  avatar?: string;
}

export interface StoryItem {
  _id: string;
  user: string | StoryUser;
  media: string;
  type: "image" | "video";
  caption?: string;
  createdAt: string;
  expiresAt?: string;
}

/** One circle in the story bar = one user + all their stories. */
export interface StoryGroup {
  user: StoryUser;
  stories: StoryItem[];
}

