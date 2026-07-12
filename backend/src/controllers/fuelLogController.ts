import { Request, Response } from "express";
import { FuelLogService } from "../services/fuelLogService";
import { sendSuccess } from "../utils/api";

export class FuelLogController {
  constructor(private readonly fuelLogService: FuelLogService) {}

  listFuelLogs = async (req: Request, res: Response) => {
    const result = await this.fuelLogService.listFuelLogs({
      page: typeof req.query.page === "string" ? Number(req.query.page) : 1,
      per_page: typeof req.query.per_page === "string" ? Number(req.query.per_page) : 10,
      vehicle_id: typeof req.query.vehicle_id === "string" ? req.query.vehicle_id : undefined,
      driver_id: typeof req.query.driver_id === "string" ? req.query.driver_id : undefined,
      trip_id: typeof req.query.trip_id === "string" ? req.query.trip_id : undefined,
      fuel_type: typeof req.query.fuel_type === "string" ? req.query.fuel_type : undefined,
      city: typeof req.query.city === "string" ? req.query.city : undefined,
      state: typeof req.query.state === "string" ? req.query.state : undefined,
      date_from: typeof req.query.date_from === "string" ? req.query.date_from : undefined,
      date_to: typeof req.query.date_to === "string" ? req.query.date_to : undefined,
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      sort: typeof req.query.sort === "string" ? req.query.sort : undefined,
    });
    sendSuccess(res, 200, "Fuel logs fetched successfully.", result.items, result.meta);
  };

  getFuelLog = async (req: Request, res: Response) => {
    const result = await this.fuelLogService.getFuelLogById(req.params.id);
    sendSuccess(res, 200, "Fuel log fetched successfully.", result);
  };

  createFuelLog = async (req: Request, res: Response) => {
    const result = await this.fuelLogService.createFuelLog(req.body);
    sendSuccess(res, 201, "Fuel log created successfully.", result);
  };

  updateFuelLog = async (req: Request, res: Response) => {
    const result = await this.fuelLogService.updateFuelLog(req.params.id, req.body);
    sendSuccess(res, 200, "Fuel log updated successfully.", result);
  };

  deleteFuelLog = async (req: Request, res: Response) => {
    const result = await this.fuelLogService.deleteFuelLog(req.params.id);
    sendSuccess(res, 200, "Fuel log deleted successfully.", result);
  };

  getMetadata = async (req: Request, res: Response) => {
    const result = await this.fuelLogService.getMetadata(
      typeof req.query.vehicle_id === "string" ? req.query.vehicle_id : undefined,
    );
    sendSuccess(res, 200, "Fuel log metadata fetched successfully.", result);
  };

  getPriceSuggestion = async (req: Request, res: Response) => {
    const result = await this.fuelLogService.getPriceSuggestion(req.body);
    sendSuccess(res, 200, "Fuel price suggestion processed successfully.", result);
  };
}
