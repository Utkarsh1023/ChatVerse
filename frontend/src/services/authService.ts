import api, { setAccessToken } from "../api/axios";

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

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

export interface MeResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const res = await api.post("/auth/register", data);
  setAccessToken(res.data.accessToken);
  return res.data;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const res = await api.post("/auth/login", data);
  setAccessToken(res.data.accessToken);
  return res.data;
};

export const logout = async () => {
  setAccessToken(null);
  return await api.post("/auth/logout");
};

export const getCurrentUser = async (): Promise<MeResponse> => {
  const res = await api.get("/auth/me");
  return res.data;
};

// Used by the axios 401 interceptor.
export const refreshAccessToken = async (): Promise<string> => {
  const res = await api.post("/auth/refresh");
  return res.data.accessToken;
};


export const getConversations = async () => {
  const res = await api.get("/conversations", {
    withCredentials: true,
  });

  return res.data;
};
