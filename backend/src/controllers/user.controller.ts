import { Request, Response } from "express";
import User from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

export const updateProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId: string | undefined =
      req.user?._id?.toString?.() ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { fullName, username, phone, country, bio, avatar } = req.body;

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        username,
        phone,
        country,
        bio,
        avatar,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    return res.json({
      success: true,
      user: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId: string | undefined =
    req.user?._id?.toString?.() ?? req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const user = await User.findById(userId).select("-password");

  return res.json({
    success: true,
    user,
  });
};

export const updateProfileAvatar = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId: string | undefined =
      req.user?._id?.toString?.() ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar file is required",
      });
    }

    // multer.memoryStorage() keeps file bytes in req.file.buffer.
    // Store avatar as a base64 data URL so it can be rendered directly in React
    // after refresh (no Cloudinary required).
    const file = req.file as any;

    if (!file?.buffer || !file?.mimetype) {
      return res.status(400).json({
        success: false,
        message: "Avatar file is not readable",
      });
    }

    const avatar = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const updated = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true }
    ).select("-password");


    return res.json({
      success: true,
      user: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to update avatar",
    });
  }
};
