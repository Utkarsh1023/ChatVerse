import API from "./axios";

export interface UserProfile {
  _id: string;
  name: string;
  fullName: string;
  username: string;
  email: string;
  bio?: string;
  country?: string;
  avatar?: string;
  coverImage?: string;
  friends?: string[];
  followers?: string[];
  following?: string[];
  posts?: string[];
  isOnline?: boolean;
}

export interface ProfileResponse {
  success: boolean;
  statusCode: number;
  message: string;
  user: UserProfile;
}
export interface PostsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  // ApiResponse spreads the payload at the TOP level (no `data` key).
  posts: ProfilePost[];
}
export interface StatsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  stats: {
    friends: number;
    followers: number;
    following: number;
    posts: number;
  };
}

/** GET /api/profile/me — full authenticated profile. */
export const getProfile = async (): Promise<UserProfile> => {
  const res = await API.get<ProfileResponse>("/profile/me");
  return res.data.user;
};

/** PUT /api/profile — update fullName / username / bio / country. */
export const updateProfile = async (
  data: Partial<Pick<UserProfile, "fullName" | "username" | "bio" | "country">>
): Promise<UserProfile> => {
  const res = await API.put<ProfileResponse>("/profile", data);
  return res.data.user;
};

/** PUT /api/profile/avatar — upload a new avatar image. */
export const updateAvatar = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await API.put<ProfileResponse>("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.user;
};

/** PUT /api/profile/cover — upload a new cover image. */
export const updateCover = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append("cover", file);

  const res = await API.put<ProfileResponse>("/profile/cover", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.user;
};

/** DELETE /api/profile/avatar — remove the avatar. */
export const deleteAvatar = async (): Promise<UserProfile> => {
  const res = await API.delete<ProfileResponse>("/profile/avatar");
  return res.data.user;
};

/** DELETE /api/profile/cover — remove the cover. */
export const deleteCover = async (): Promise<UserProfile> => {
  const res = await API.delete<ProfileResponse>("/profile/cover");
  return res.data.user;
};

/** GET /api/profile/stats — friends / followers / following / posts counts. */
export const getProfileStats = async (username: string): Promise<StatsResponse["stats"]> => {
  // 🐞 TRACE: confirm the endpoint. For another user this must be
  // /profile/:username/stats — never /profile/stats or /profile/me.
  console.log(`[profileApi] getProfileStats -> GET /profile/${username}/stats`);
  const res = await API.get<StatsResponse>(`/profile/${username}/stats`);
  return res.data.stats;
};

export const getProfileByUsername = async (username: string) => {
  // 🐞 TRACE: confirm the endpoint. For another user this must be
  // /profile/:username — never /profile/me.
  console.log(`[profileApi] getProfileByUsername -> GET /profile/${username}`);
  const res = await API.get(`/profile/${username}`);
  return res.data.user;
};

export interface PostMedia {
  url: string;
  public_id: string;
  type: "image" | "video" | "raw" | "audio";
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  thumbnailUrl?: string;
}

export interface ProfilePost {
  _id: string;
  author: string | { _id: string; name: string; username: string; avatar: string };
  caption: string;
  media: PostMedia[];
  tags?: string[];
  location?: string;
  privacy?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DataResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/**
 * GET /api/profile/posts/:username — all posts by a user.
 * Resolved by USERNAME (the URL param from useParams()), NOT by userId.
 */
export const getPosts = async (
  username: string
): Promise<ProfilePost[]> => {
  console.log(`[profileApi] getPosts -> GET /profile/posts/${username}`);

  const res = await API.get<PostsResponse>(`/profile/posts/${username}`);

  // 🐞 TRACE: ApiResponse spreads payload at top level — read res.data.posts.
  console.log(`[profileApi] getPosts res.data.posts =>`, res.data.posts);

  return res.data.posts;
};

export interface FriendsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  // ApiResponse spreads the payload at the TOP level (no `data` key).
  friends: UserProfile[];
}
/**
 * GET /api/profile/friends/:username — populated friends list.
 */
export const getFriends = async (
  username: string
): Promise<UserProfile[]> => {
  console.log(`[profileApi] getFriends -> GET /profile/friends/${username}`);

  const res = await API.get<FriendsResponse>(
    `/profile/friends/${username}`
  );

  // 🐞 TRACE: ApiResponse spreads payload at top level — read res.data.friends.
  console.log(`[profileApi] getFriends res.data.friends =>`, res.data.friends);

  return res.data.friends;
};
/**
 * GET /api/profile/followers/:username — populated followers list.
 */
export interface FollowersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  // ApiResponse spreads the payload at the TOP level (no `data` key).
  followers: UserProfile[];
}

export const getFollowers = async (
  username: string
): Promise<UserProfile[]> => {
  console.log(`[profileApi] getFollowers -> GET /profile/followers/${username}`);

  const res = await API.get<FollowersResponse>(
    `/profile/followers/${username}`
  );

  // 🐞 TRACE: ApiResponse spreads payload at top level — read res.data.followers.
  console.log(`[profileApi] getFollowers res.data.followers =>`, res.data.followers);

  return res.data.followers;
};
/**
 * GET /api/profile/following/:username — populated following list.
 */
export interface FollowingResponse {
  success: boolean;
  statusCode: number;
  message: string;
  // ApiResponse spreads the payload at the TOP level (no `data` key).
  following: UserProfile[];
}

export const getFollowing = async (
  username: string
): Promise<UserProfile[]> => {
  console.log(`[profileApi] getFollowing -> GET /profile/following/${username}`);

  const res = await API.get<FollowingResponse>(
    `/profile/following/${username}`
  );

  // 🐞 TRACE: ApiResponse spreads payload at top level — read res.data.following.
  console.log(`[profileApi] getFollowing res.data.following =>`, res.data.following);

  return res.data.following;
};

