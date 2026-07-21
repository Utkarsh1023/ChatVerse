import API from "./axios";

export const createPost = (formData: FormData) => {
  return API.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getPosts = () =>
  API.get("/posts");

export const toggleLike = (postId: string) =>
  API.post(`/posts/${postId}/like`);
