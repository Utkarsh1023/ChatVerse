import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export const getProfile = async () => {
  const res = await API.get("/users/profile");
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await API.put("/users/profile", data);
  return res.data;
};

export const updateProfileAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await API.post("/users/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
export default API;