import axios from "./axios";

// ---- Types ----

export interface CommentUser {
  _id: string;
  fullName: string;
  username: string;
  avatar?: string;
}

export interface CommentData {
  _id: string;
  post: string;
  user: CommentUser;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentsResponse {
  success: boolean;
  comments: CommentData[];
}

export interface CommentResponse {
  success: boolean;
  comment: CommentData;
}

// ---- API Calls ----

export const getComments = (postId: string) =>
  axios.get<CommentsResponse>(`/comments/${postId}`);

export const createComment = (postId: string, text: string) =>
  axios.post<CommentResponse>(
    "/comments",
    { postId, text },
    { withCredentials: true }
  );
