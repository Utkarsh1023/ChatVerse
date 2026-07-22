import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
import {Server} from "socket.io";
import http from "http";

dotenv.config();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
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
