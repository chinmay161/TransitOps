import { Request, Response } from "express";
import { ReportService } from "../services/reportService";
import { sendSuccess } from "../utils/api";

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  listHistory = async (_req: Request, res: Response) => {
    const result = await this.reportService.listHistory();
    sendSuccess(res, 200, "Report history fetched successfully.", result);
  };

  generate = async (req: Request, res: Response) => {
    const result = await this.reportService.generate(req.params.type, req.query as Record<string, string | undefined>);

    if (result.contentType === "application/json") {
      sendSuccess(res, 200, "Report generated successfully.", result.body);
      return;
    }

    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.status(200).send(result.body);
  };

  favoriteHistory = async (req: Request, res: Response) => {
    const result = await this.reportService.updateFavorite(req.params.id, Boolean(req.body.is_favorite));
    sendSuccess(res, 200, "Report favorite status updated successfully.", result);
  };

  deleteHistory = async (req: Request, res: Response) => {
    const result = await this.reportService.deleteHistory(req.params.id);
    sendSuccess(res, 200, "Report history deleted successfully.", result);
  };
}
