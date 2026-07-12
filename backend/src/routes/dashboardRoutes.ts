import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController";
import { asyncHandler } from "../utils/asyncHandler";

export function createDashboardRouter(controller: DashboardController) {
  const router = Router();

  router.get("/filters", asyncHandler(controller.getFiltersMetadata));
  router.get("/role/:role", asyncHandler(controller.getRoleDashboard));
  router.get("/overview", asyncHandler(controller.getOverview));
  router.get("/fleet", asyncHandler(controller.getFleet));
  router.get("/trips", asyncHandler(controller.getTrips));
  router.get("/drivers", asyncHandler(controller.getDrivers));
  router.get("/fuel", asyncHandler(controller.getFuel));
  router.get("/expenses", asyncHandler(controller.getExpenses));
  router.get("/maintenance", asyncHandler(controller.getMaintenance));
  router.get("/finance", asyncHandler(controller.getFinance));
  router.get("/live", asyncHandler(controller.getLive));
  router.get("/notifications", asyncHandler(controller.getNotifications));

  return router;
}
