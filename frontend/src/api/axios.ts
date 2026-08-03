import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

// Restore token from localStorage on app boot (called from AuthContext).
export const restoreAccessToken = () => {
  accessToken = localStorage.getItem("accessToken");
  return accessToken;
};

export const getAccessToken = () => accessToken;

// ---- Request interceptor: attach Bearer token to every request ----
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ---- Response interceptor: auto-refresh access token on 401 ----
let refreshPromise: Promise<string | null> | null = null;

API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh") ||
      originalRequest?.url?.includes("/auth/logout");

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = API.post("/auth/refresh")
            .then((res) => {
              const newToken: string = res.data.accessToken;
              setAccessToken(newToken);
              return newToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed — clear session.
        setAccessToken(null);

        const path = window.location.pathname;
        const isAuthPage =
          path.startsWith("/auth") ||
          path.startsWith("/login") ||
          path.startsWith("/register");

        if (!isAuthPage) {
          window.location.href = "/auth";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ---- Profile helpers (kept from original file) ----
// NOTE: These point to /api/profile/* (the profile module). The typed
// wrappers live in src/api/profile.ts — use those for new code.
export const getProfile = async () => {
  const res = await API.get("/profile/me");
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await API.put("/profile", data);
  return res.data;
};

export const updateProfileAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await API.put("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export default API;

