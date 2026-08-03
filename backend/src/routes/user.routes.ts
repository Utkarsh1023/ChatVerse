import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { searchUsers, getSuggestions } from "../controllers/user.controller";

const router = Router();

router.get("/search", verifyToken, searchUsers);

router.get("/suggestions", verifyToken, getSuggestions);

export default router;
