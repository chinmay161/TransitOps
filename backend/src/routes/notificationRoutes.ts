import { Router } from "express";
import { NotificationController } from "../controllers/notificationController";
import { asyncHandler } from "../utils/asyncHandler";

export function createNotificationRouter(controller: NotificationController) {
  const router = Router();
  router.get("/", asyncHandler(controller.listNotifications));
  router.post("/", asyncHandler(controller.createNotification));
  router.patch("/mark-all-read", asyncHandler(controller.markAllAsRead));
  router.get("/:id", asyncHandler(controller.getNotification));
  router.patch("/:id/read", asyncHandler(controller.markAsRead));
  router.delete("/:id", asyncHandler(controller.deleteNotification));
  return router;
}
