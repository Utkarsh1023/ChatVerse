import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import * as authService from "../services/authService";

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
}


interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: typeof authService.login;
  register: typeof authService.register;

  logout: () => Promise<void>;
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
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await authService.getCurrentUser();

      setUser(res.user);
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
    await authService.logout();

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);