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

  // Token sourcing: for now, try to read from a non-httpOnly cookie if present.
  // If you haven't created one, pass a token via your app-specific flow.
  const token = useMemo(() => {
    // If you store JWT in memory/localStorage, read it here.
    // Your backend uses httpOnly cookies for REST, so default to undefined.
    // Example:
    // const t = window.localStorage.getItem("token");
    // return t ?? undefined;
    return undefined as string | undefined;
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const s = createSocket(token);

    setSocket(s);

    s.on("connect", () => {
        console.log("Connected", s.id);
        s.emit("userOnline", user.id);
    });

    return () => {
        s.disconnect();
        setSocket(null);
    };
}, [user?.id, token]);

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


