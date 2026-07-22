import { io } from "socket.io-client";

// NOTE: JWT must be passed in handshake auth for backend socket middleware.
// The token is stored in httpOnly cookies for REST; frontend can't read it.
// For now, we rely on a token string you can pass via AuthContext or env.
// Production: expose a secure endpoint like GET /api/auth/socket-token.

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:5000";

export const createSocket = (token?: string) => {
  return io(WS_URL, {
    withCredentials: true,
    auth: token ? { token } : undefined,
    autoConnect: true,
  });
};

