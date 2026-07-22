import { Router } from "express";

import {
  register,
  login,
  logout,
  me,
  getSocketToken,
} from "../controllers/auth.controller";


import { protect } from "../middleware/auth.middleware";

const router = Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Protected Route
router.get("/me", protect, me);

// Logout
router.post("/logout", logout);

// Socket token endpoint — returns a JWT for socket.io auth
router.get("/socket-token", protect, getSocketToken);

export default router;
