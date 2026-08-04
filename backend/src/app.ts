import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/error.middleware";
import conversationRoutes from "./routes/conversation.routes";
import postRoutes from "./routes/post.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import friendRoutes from "./routes/friend.routes";
import friendsRoutes from "./routes/friends.routes";
import connectionsRoutes from "./routes/connections.routes";
import userRoutes from "./routes/user.routes";
import profileRoutes from "./routes/profile.routes";
import storyRoutes from "./routes/story.routes";
import commentRoutes from "./routes/comment.routes";
import notificationRoutes from "./routes/notification.routes";
import path from "path";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "https://chat-verse-gules.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, same-origin).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

const isDev = process.env.NODE_ENV !== "production";

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 200,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
// Security & logging
app.use(helmet());
app.use(cookieParser());
app.use(morgan("dev"));

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "ChatVerse Backend Running" });
});

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "ChatVerse Backend Running",
  });
});

// API routes
app.use("/api/auth", authRoutes);

// Conversation routes
app.use("/api/conversations", conversationRoutes);

// Post routes
app.use("/api/posts", postRoutes);

// Chat routes
app.use("/api/chat", chatRoutes);

// Message routes (conversation-based)
app.use("/api/messages", messageRoutes);

// User routes (search, suggestions, profile, etc.)
app.use("/api/users", userRoutes);

// Friend routes
app.use("/api/friends", friendRoutes);

// Friends Dashboard routes (new single-request dashboard + accept/reject/remove)
app.use("/api/friends", friendsRoutes);

// Connections routes (unified friends/followers/following dashboard + follow actions)
app.use("/api/connections", connectionsRoutes);

// Profile routes
app.use("/api/profile", profileRoutes);

// Story routes
app.use("/api/stories", storyRoutes);

// Comment routes
app.use("/api/comments", commentRoutes);

// Notification routes
app.use("/api/notifications", notificationRoutes);

// 404 handler for unknown API routes — prevents hanging requests.
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler — MUST be last.
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  errorHandler(err, req, res, _next);
});

export default app;

