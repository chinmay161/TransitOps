import { Request, Response } from "express";
import { ExpenseService } from "../services/expenseService";
import { sendSuccess, ApiError } from "../utils/api";
import { AuthRequest } from "../modules/auth/auth.middleware";

export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  getMetadata = async (_req: Request, res: Response) => {
    const result = await this.expenseService.getMetadata();
    sendSuccess(res, 200, "Expense metadata fetched successfully.", result);
  };

  getSummary = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const query = { ...(req.query as Record<string, string | undefined>) };

    if (authReq.user?.role === "driver") {
      if (!authReq.user.driver_id) {
        return sendSuccess(res, 200, "Expense summary fetched successfully.", {
          summary: {
            total_expense_records: 0,
            base_amount: 0,
            total_tax: 0,
            total_discount: 0,
            total_amount: 0,
            pending_amount: 0,
            approved_amount: 0,
            paid_amount: 0
          }
        });
      }
      query.driver_id = authReq.user.driver_id;
    }

    const result = await this.expenseService.getSummary(query);
    sendSuccess(res, 200, "Expense summary fetched successfully.", result);
  };

  listExpenses = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const query = { ...(req.query as Record<string, string | undefined>) };

    if (authReq.user?.role === "driver") {
      if (!authReq.user.driver_id) {
        return sendSuccess(res, 200, "Expenses fetched successfully.", []);
      }
      query.driver_id = authReq.user.driver_id;
    }

    const result = await this.expenseService.listExpenses(query);
    sendSuccess(res, 200, "Expenses fetched successfully.", result);
  };

  listApprovals = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (authReq.user?.role === "driver") {
      return sendSuccess(res, 200, "Expense approvals fetched successfully.", []);
    }

    const result = await this.expenseService.listApprovals(req.query as Record<string, string | undefined>);
    sendSuccess(res, 200, "Expense approvals fetched successfully.", result);
  };

  getExpense = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const result = await this.expenseService.getExpenseById(req.params.id);

    if (authReq.user?.role === "driver" && result.driver_id !== authReq.user.driver_id) {
      throw new ApiError(403, "You can only view your own expenses.");
    }

    sendSuccess(res, 200, "Expense fetched successfully.", result);
  };

  createExpense = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const payload = { ...req.body };

    if (authReq.user?.role === "driver") {
      if (!authReq.user.driver_id) {
        throw new ApiError(403, "Driver profile not found.");
      }
      payload.driver_id = authReq.user.driver_id;
      payload.expense_status = "pending";
      payload.approved_by = null;
    }

    const result = await this.expenseService.createExpense(payload);
    sendSuccess(res, 201, "Expense created successfully.", result);
  };

  updateExpense = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const existing = await this.expenseService.getExpenseById(req.params.id);

    if (authReq.user?.role === "driver") {
      if (existing.driver_id !== authReq.user.driver_id) {
        throw new ApiError(403, "You can only edit your own expenses.");
      }
      req.body.driver_id = authReq.user.driver_id;
      req.body.expense_status = existing.expense_status; // Drivers cannot alter approval status
    }

    const result = await this.expenseService.updateExpense(req.params.id, req.body);
    sendSuccess(res, 200, "Expense updated successfully.", result);
  };

  updateExpenseStatus = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (authReq.user?.role === "driver") {
      throw new ApiError(403, "Drivers are not authorized to approve or reject expenses.");
    }

    const result = await this.expenseService.updateExpenseStatus(req.params.id, req.body);
    sendSuccess(res, 200, "Expense status updated successfully.", result);
  };

  deleteExpense = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const existing = await this.expenseService.getExpenseById(req.params.id);

    if (authReq.user?.role === "driver" && existing.driver_id !== authReq.user.driver_id) {
      throw new ApiError(403, "You can only delete your own expenses.");
    }

    const result = await this.expenseService.deleteExpense(req.params.id);
    sendSuccess(res, 200, "Expense deleted successfully.", result);
  };
}
