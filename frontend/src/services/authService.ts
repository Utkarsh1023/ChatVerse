import api from "../api/axios";

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const login = async (data: LoginData) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const logout = async () => {
  // const res = await api.post("/auth/logout");
  // return res.data;
  return await api.post("/auth/logout");
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};