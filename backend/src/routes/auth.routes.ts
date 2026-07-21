import { Router } from "express";

import {
  register,
  login,
  logout,
  me,
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

export default router;