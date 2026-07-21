import type { Request } from "express";
import { AppError } from "../errors/AppError";

// Helper used by services/controllers
export const getAuthUserId = (req: Request): string => {
  const anyReq = req as any;
  const user = anyReq.user;
  const userId: string | undefined = user?._id?.toString?.() ?? user?.id;

  if (!userId) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  return userId;
};

