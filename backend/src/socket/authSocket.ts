import type { Socket } from "socket.io";

type NextFunction = (err?: Error) => void;

import jwt from "jsonwebtoken";
import type { AppSocket, SocketUserId } from "./types";
import User from "../models/User";

const verifySocketJwt = async (socket: AppSocket, next: NextFunction) => {
  try {
    // Socket.IO client can send: io(..., { auth: { token } })
    const token = (socket.handshake.auth?.token as string | undefined) ?? undefined;

    if (!token) {
      return next(new Error("Unauthorized: missing token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: SocketUserId };

    const user = await User.findById(decoded.id).select("_id");
    if (!user) return next(new Error("Unauthorized: user not found"));

    socket.data.userId = user._id.toString();
    return next();
  } catch {
    return next(new Error("Unauthorized"));
  }
};

export default verifySocketJwt;

