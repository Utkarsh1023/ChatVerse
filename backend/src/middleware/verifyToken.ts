import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };

  // Backward-compatible alias for controllers that read `req.userId`
  // (e.g. user.controller.ts searchUsers).
  userId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * JWT payload shape produced by `generateAccessToken` (see utils/jwt.ts).
 * The token only ever contains `{ id }` — `email` is optional at runtime
 * even though the type declares it as required (kept for compatibility
 * with the `JwtPayload` augmentation in auth.middleware.ts).
 */
type DecodedToken = JwtPayload & {
  id?: string;
  email?: string;
};

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as DecodedToken;

    // CRITICAL: the JWT must contain a user `id`. Without it we cannot
    // know who the caller is — treat as unauthenticated instead of letting
    // a `undefined` userId leak into queries (which would break the
    // `$ne` self-exclusion and make the user appear in their own search).
    if (!decoded || typeof decoded.id !== "string" || decoded.id.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    // Attach the authenticated user to the request so controllers can read
    // `req.user.id`. Without this, `req.user!.id` in a controller throws
    // `TypeError: Cannot read properties of undefined (reading 'id')`.
    req.user = {
      id: decoded.id,
      email: decoded.email ?? "",
    };

    // Backward-compatible alias for controllers that read `req.userId`.
    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

