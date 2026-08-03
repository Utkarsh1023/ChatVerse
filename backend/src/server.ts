// ⚠️ MUST be the very first import — loads .env before any config module
// (e.g. cloudinary.ts) reads process.env at import time.
import "./config/env";

import http from "http";
import mongoose from "mongoose";
import app from "./app";
import { connectDB } from "./config/db";
import { initSocket } from "./socket/socket";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    // Attach Socket.IO to the SAME http server.
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown — close DB + server on Ctrl+C.
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await mongoose.disconnect();
        } catch {
          // ignore
        }
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

