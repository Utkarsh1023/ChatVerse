import { Router } from "express";
import uploadPostRoutes from "./uploadPost.routes";

const router = Router();

// Mounted as: app.use('/api', uploadRoutes)
// So actual path becomes /api/post or /api/upload/post depending on nested mounts.
router.use("/upload", uploadPostRoutes);

export default router;




