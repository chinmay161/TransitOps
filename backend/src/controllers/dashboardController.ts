import { Request, Response } from "express";
import { DashboardService } from "../services/dashboardService";
import { sendSuccess } from "../utils/api";

function extractFilters(req: Request) {
  return {
    date_from: typeof req.query.date_from === "string" ? req.query.date_from : undefined,
    date_to: typeof req.query.date_to === "string" ? req.query.date_to : undefined,
    vehicle_id: typeof req.query.vehicle_id === "string" ? req.query.vehicle_id : undefined,
    driver_id: typeof req.query.driver_id === "string" ? req.query.driver_id : undefined,
    trip_id: typeof req.query.trip_id === "string" ? req.query.trip_id : undefined,
    region: typeof req.query.region === "string" ? req.query.region : undefined,
    fuel_type: typeof req.query.fuel_type === "string" ? req.query.fuel_type : undefined,
  };
}

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getFiltersMetadata = async (_req: Request, res: Response) => {
    const result = await this.dashboardService.getFiltersMetadata();
    sendSuccess(res, 200, "Dashboard filter metadata fetched successfully.", result);
  };

  getRoleDashboard = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getRoleDashboard(req.params.role, extractFilters(req));
    sendSuccess(res, 200, "Role dashboard fetched successfully.", result);
  };

  getOverview = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getOverview(extractFilters(req));
    sendSuccess(res, 200, "Dashboard overview fetched successfully.", result);
  };

  getFleet = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getFleet(extractFilters(req));
    sendSuccess(res, 200, "Dashboard fleet analytics fetched successfully.", result);
  };

  getTrips = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getTrips(extractFilters(req));
    sendSuccess(res, 200, "Dashboard trip analytics fetched successfully.", result);
  };

  getDrivers = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getDrivers(extractFilters(req));
    sendSuccess(res, 200, "Dashboard driver analytics fetched successfully.", result);
  };

  getFuel = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getFuel(extractFilters(req));
    sendSuccess(res, 200, "Dashboard fuel analytics fetched successfully.", result);
  };

  getExpenses = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getExpenses(extractFilters(req));
    sendSuccess(res, 200, "Dashboard expense analytics fetched successfully.", result);
  };

  getMaintenance = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getMaintenance(extractFilters(req));
    sendSuccess(res, 200, "Dashboard maintenance analytics fetched successfully.", result);
  };

  getFinance = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getFinance(extractFilters(req));
    sendSuccess(res, 200, "Dashboard finance analytics fetched successfully.", result);
  };

  getLive = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getLive(extractFilters(req));
    sendSuccess(res, 200, "Dashboard live operations fetched successfully.", result);
  };

  getNotifications = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getNotifications(extractFilters(req));
    sendSuccess(res, 200, "Dashboard notifications fetched successfully.", result);
  };
}
