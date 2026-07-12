import { Router } from "express";
import { FuelLogController } from "../controllers/fuelLogController";
import { asyncHandler } from "../utils/asyncHandler";

export function createFuelLogRouter(controller: FuelLogController) {
  const router = Router();

  router.get("/metadata", asyncHandler(controller.getMetadata));
  router.post("/price-suggestion", asyncHandler(controller.getPriceSuggestion));
  router.get("/", asyncHandler(controller.listFuelLogs));
  router.get("/:id", asyncHandler(controller.getFuelLog));
  router.post("/", asyncHandler(controller.createFuelLog));
  router.put("/:id", asyncHandler(controller.updateFuelLog));
  router.delete("/:id", asyncHandler(controller.deleteFuelLog));

  return router;
}
