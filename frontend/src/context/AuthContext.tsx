import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import * as authService from "../services/authService";
import { setAccessToken, restoreAccessToken } from "../api/axios";

interface User {
  id?: string;
  // core auth fields
  name: string;
  username: string;
  email: string;

  // profile fields (used across the website for settings + avatars)
  fullName?: string;
  phone?: string;
  country?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;

  // social graph (populated by GET /api/profile/me)
  friends?: Array<Record<string, unknown>> | string[];
  followers?: Array<Record<string, unknown>> | string[];
  following?: Array<Record<string, unknown>> | string[];
  posts?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: typeof authService.login;
  register: typeof authService.register;

  logout: () => Promise<void>;
  /** Merge partial profile updates into the authenticated user. */
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore the access token from localStorage BEFORE calling /auth/me
    // so the request interceptor attaches the Bearer header.
    restoreAccessToken();
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    try {
      const res = await authService.getCurrentUser();

      // Normalize backend user shape (id vs _id).
      const data = res.user as any;
      setUser({
        ...data,
        id: data._id || data.id,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: authService.LoginData) => {
    const res = await authService.login(data);

    setUser(res.user);

    return res;
  };

  const register = async (data: authService.RegisterData) => {
    const res = await authService.register(data);

    setUser(res.user);

    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  /** Merge partial profile updates (e.g. a new coverImage) into the user. */
  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

