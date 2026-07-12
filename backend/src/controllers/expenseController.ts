import { Request, Response } from "express";
import { ExpenseService } from "../services/expenseService";
import { sendSuccess } from "../utils/api";

export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  getMetadata = async (_req: Request, res: Response) => {
    const result = await this.expenseService.getMetadata();
    sendSuccess(res, 200, "Expense metadata fetched successfully.", result);
  };

  getSummary = async (req: Request, res: Response) => {
    const result = await this.expenseService.getSummary(req.query as Record<string, string | undefined>);
    sendSuccess(res, 200, "Expense summary fetched successfully.", result);
  };

  listExpenses = async (req: Request, res: Response) => {
    const result = await this.expenseService.listExpenses(req.query as Record<string, string | undefined>);
    sendSuccess(res, 200, "Expenses fetched successfully.", result);
  };

  listApprovals = async (req: Request, res: Response) => {
    const result = await this.expenseService.listApprovals(req.query as Record<string, string | undefined>);
    sendSuccess(res, 200, "Expense approvals fetched successfully.", result);
  };

  getExpense = async (req: Request, res: Response) => {
    const result = await this.expenseService.getExpenseById(req.params.id);
    sendSuccess(res, 200, "Expense fetched successfully.", result);
  };

  createExpense = async (req: Request, res: Response) => {
    const result = await this.expenseService.createExpense(req.body);
    sendSuccess(res, 201, "Expense created successfully.", result);
  };

  updateExpense = async (req: Request, res: Response) => {
    const result = await this.expenseService.updateExpense(req.params.id, req.body);
    sendSuccess(res, 200, "Expense updated successfully.", result);
  };

  updateExpenseStatus = async (req: Request, res: Response) => {
    const result = await this.expenseService.updateExpenseStatus(req.params.id, req.body);
    sendSuccess(res, 200, "Expense status updated successfully.", result);
  };

  deleteExpense = async (req: Request, res: Response) => {
    const result = await this.expenseService.deleteExpense(req.params.id);
    sendSuccess(res, 200, "Expense deleted successfully.", result);
  };
}
