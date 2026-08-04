import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import { validateRequest } from "../validators/profile.validator";
import {
  notificationIdValidator,
  paginationValidators,
} from "../validators/notification.validator";
import {
  getNotificationsController,
  getUnreadCountController,
  markReadController,
  markAllReadController,
  deleteNotificationController,
} from "../controllers/notification.controller";

const router = express.Router();

// All notification routes require authentication.
router.use(verifyToken);

router.get(
  "/",
  paginationValidators(),
  validateRequest,
  getNotificationsController
);

router.get("/unread-count", getUnreadCountController);

router.patch(
  "/:id/read",
  notificationIdValidator(),
  validateRequest,
  markReadController
);

router.patch("/read-all", markAllReadController);

router.delete(
  "/:id",
  notificationIdValidator(),
  validateRequest,
  deleteNotificationController
);

export default router;
