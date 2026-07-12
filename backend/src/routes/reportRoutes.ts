import { Router } from "express";
import { ReportController } from "../controllers/reportController";
import { asyncHandler } from "../utils/asyncHandler";

export function createReportRouter(controller: ReportController) {
  const router = Router();
  router.get("/history", asyncHandler(controller.listHistory));
  router.patch("/history/:id/favorite", asyncHandler(controller.favoriteHistory));
  router.delete("/history/:id", asyncHandler(controller.deleteHistory));
  router.get("/:type", asyncHandler(controller.generate));
  return router;
}
