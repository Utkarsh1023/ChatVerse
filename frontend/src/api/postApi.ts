import axios from "./axios";

export const createPost = (formData: FormData) => {
  return axios.post("/posts/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getPosts = () =>
  axios.get("/posts");

export const toggleLike = (postId: string) =>
  axios.post(`/posts/${postId}/like`);

