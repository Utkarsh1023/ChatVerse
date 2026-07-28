import app from "./app";
import { connectDB } from "./config/db";
import {Server} from "socket.io";
import http from "http";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Build socket.io CORS origins from CLIENT_URL (same source as Express CORS)
const socketCorsOrigins = [
  (process.env.CLIENT_URL || "").trim(),
  "http://localhost:5173",
].filter(Boolean);

export const io = new Server(server, {
  cors: {
    origin: socketCorsOrigins,
    credentials: true,
  },
});

export default server;

const startServer = async () => {
  await connectDB();

  // Boot Socket.IO after DB init (socket events will use in-memory presence for now)
  const { initSocket } = await import("./socket/index");
  initSocket(io);

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
