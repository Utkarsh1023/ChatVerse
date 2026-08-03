import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  getCurrentUser,
  getSocketToken,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/logout", logout);

router.post("/refresh", refresh);

router.get("/me", protect, getCurrentUser);

// Socket.IO handshake token — requires an authenticated request.
router.get("/socket-token", protect, getSocketToken);

export default router;

