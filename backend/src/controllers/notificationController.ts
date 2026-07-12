import { Request, Response } from "express";
import { NotificationService } from "../services/notificationService";
import { sendSuccess } from "../utils/api";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  listNotifications = async (req: Request, res: Response) => {
    const result = await this.notificationService.listNotifications(req.query as Record<string, string | undefined>);
    sendSuccess(res, 200, "Notifications fetched successfully.", result);
  };

  getNotification = async (req: Request, res: Response) => {
    const result = await this.notificationService.getNotificationById(req.params.id);
    sendSuccess(res, 200, "Notification fetched successfully.", result);
  };

  createNotification = async (req: Request, res: Response) => {
    const result = await this.notificationService.createNotification(req.body);
    sendSuccess(res, 201, "Notification created successfully.", result);
  };

  markAsRead = async (req: Request, res: Response) => {
    const result = await this.notificationService.markAsRead(req.params.id);
    sendSuccess(res, 200, "Notification marked as read.", result);
  };

  markAllAsRead = async (_req: Request, res: Response) => {
    const result = await this.notificationService.markAllAsRead();
    sendSuccess(res, 200, "Notifications marked as read.", result);
  };

  deleteNotification = async (req: Request, res: Response) => {
    const result = await this.notificationService.deleteNotification(req.params.id);
    sendSuccess(res, 200, "Notification deleted successfully.", result);
  };
}
