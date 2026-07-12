import { Request, Response } from "express";
import { AdminSettingsService } from "../services/adminSettingsService";
import { sendSuccess } from "../utils/api";

export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  getSettings = async (_req: Request, res: Response) => {
    const result = await this.adminSettingsService.getSettings();
    sendSuccess(res, 200, "Admin settings fetched successfully.", result);
  };

  updateSettings = async (req: Request, res: Response) => {
    const result = await this.adminSettingsService.updateSettings(req.body);
    sendSuccess(res, 200, "Admin settings updated successfully.", result);
  };

  listAuditLogs = async (_req: Request, res: Response) => {
    const result = await this.adminSettingsService.listAuditLogs();
    sendSuccess(res, 200, "Audit logs fetched successfully.", result);
  };
}
