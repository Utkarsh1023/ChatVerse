import { Request, Response } from "express";
import User from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth.middleware";
import { refreshCookieOptions } from "../utils/cookieOptions";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";

export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, username, email, password } = req.body;

    // Normalize BEFORE querying DB so we never miss a duplicate
    // (schema stores email/username as lowercase).
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password,
    });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie(
      "refreshToken",
      refreshToken,
      refreshCookieOptions
    );

    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio ?? "",
        country: user.country ?? "",
        coverImage: user.coverImage ?? "",
      },
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Support login with email OR username.
    const normalized = email.trim().toLowerCase();

    // password is select:false in the schema — must explicitly select it.
    const user = await User.findOne({
      $or: [{ email: normalized }, { username: normalized }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie(
      "refreshToken",
      refreshToken,
      refreshCookieOptions
    );

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio ?? "",
        country: user.country ?? "",
        coverImage: user.coverImage ?? "",
      },
    });
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (token) {
      await User.findOneAndUpdate(
        { refreshToken: token },
        { refreshToken: "" }
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
);

export const refresh = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.sendStatus(401);
    }

    let decoded: any;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET!
      );
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // refreshToken is select:false in the schema — explicitly select it.
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({
        success: false,
        message: "Refresh token mismatch",
      });
    }

    const accessToken = generateAccessToken(user._id.toString());

    res.json({
      success: true,
      accessToken,
    });
  }
);

export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.userId).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  }
);

// Issues a short-lived access token for Socket.IO handshake auth
// (JWT lives in an httpOnly cookie which the frontend cannot read).
export const getSocketToken = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const token = generateAccessToken(req.userId!);
    res.json({ success: true, token });
  }
);

