import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "../socket/socket";
import { useAuth } from "./AuthContext";
import type { ServerToClientEvents, SocketUserId } from "../socket/socketTypes";

type SocketCtx = {
  socket: Socket<ServerToClientEvents, any> | null;
  onlineUsers: Set<SocketUserId>;
  typingUsers: Set<SocketUserId>;
};

const SocketContext = createContext<SocketCtx>(null!);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<SocketUserId>>(() => new Set());
  const [typingUsers, setTypingUsers] = useState<Set<SocketUserId>>(() => new Set());
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, any> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch socket token from backend on auth change
  const [socketToken, setSocketToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!user?.id) {
      setSocketToken(undefined);
      return;
    }

    // Fetch a JWT token for socket.io authentication
    const fetchToken = async () => {
      try {
        const api = (await import("../api/axios")).default;
        const res = await api.get("/auth/socket-token");
        setSocketToken(res.data.token);
      } catch (err) {
        console.error("Failed to fetch socket token:", err);
        setSocketToken(undefined);
      }
    };

    fetchToken();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !socketToken) return;

    const s = createSocket(socketToken);

    setSocket(s);

    s.on("connect", () => {
        console.log("Connected", s.id);
        s.emit("userOnline", user.id);
    });

    return () => {
        s.disconnect();
        setSocket(null);
    };
}, [user?.id, socketToken]);

  const ctx: SocketCtx = useMemo(
    () => ({
      socket: socket as any,
      onlineUsers,
      typingUsers,
    }),
    [socket, onlineUsers, typingUsers]
  );

  return <SocketContext.Provider value={ctx}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => useContext(SocketContext);


