import { Router } from "express";
import { AdminSettingsController } from "../controllers/adminSettingsController";
import { asyncHandler } from "../utils/asyncHandler";

export function createAdminSettingsRouter(controller: AdminSettingsController) {
  const router = Router();
  router.get("/", asyncHandler(controller.getSettings));
  router.put("/", asyncHandler(controller.updateSettings));
  router.get("/audit-logs", asyncHandler(controller.listAuditLogs));
  return router;
}
