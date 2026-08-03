import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import multer from "multer";
import ApiError from "../utils/ApiError";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Custom API errors (explicit status + message)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined ? { error: err.details } : {}),
    });
  }

  // Multer upload errors (file too large, wrong MIME type, etc.)
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large. Maximum allowed size is 5 MB."
        : err.message;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Mongoose duplicate key (email/username already exists)
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Mongoose validation errors (schema-level)
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      message: messages[0],
    });
  }

  // Mongoose CastError (bad ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Invalid/expired JWT
  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // CORS errors
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Not allowed by CORS",
    });
  }

  // MongoDB Atlas authorization error (code 8000) — the DB user in MONGODB_URI
  // does not have read/write permission on the target database.
  // Example: 'user is not allowed to do action [insert] on [premium-chat.users]'
  if (
    err?.code === 8000 ||
    err?.errorResponse?.code === 8000 ||
    /not allowed to do action/i.test(err?.message || "")
  ) {
    console.error(
      "❌ MongoDB permission error — your Atlas user lacks read/write access:",
      err?.message
    );
    return res.status(500).json({
      success: false,
      message:
        "Database permission error: your MongoDB user does not have write access. " +
        "Open MongoDB Atlas → Database Access → edit your user → grant 'Read and write to any database' " +
        "(or readWrite on the target database), then restart the backend.",
    });
  }

  console.error("❌ Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

