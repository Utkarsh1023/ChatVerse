import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import postsRoutes from "./routes/posts.routes";
import uploadRoutes from "./routes/upload.routes";
import commentRoutes from "./routes/comment.routes";
import chatRoutes from "./routes/chat.routes";
import { errorMiddleware } from "./middleware/error.middleware";

dotenv.config();

const app = express();

// Build allowed origins list, trimming any whitespace from env vars
const rawClientUrl = (process.env.CLIENT_URL || "").trim();
const allowedOrigins = [
  rawClientUrl,
  "http://localhost:5173",
].filter(Boolean); // remove empty strings

console.log("[cors] allowed origins:", allowedOrigins);

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }
      // Check if origin is in our allowed list (trimmed comparison)
      if (allowedOrigins.some((allowed) => allowed && allowed.trim() === origin.trim())) {
        return callback(null, true);
      }
      console.warn(`[cors] blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Static folder
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// Test Route
app.get("/", (_, res) => {
  res.send("Backend Running 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", uploadRoutes);

// Error Handler
app.use(errorMiddleware);

export default app;