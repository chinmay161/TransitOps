import { Router } from "express";
import { ExpenseController } from "../controllers/expenseController";
import { asyncHandler } from "../utils/asyncHandler";

export function createExpenseRouter(controller: ExpenseController) {
  const router = Router();

  router.get("/metadata", asyncHandler(controller.getMetadata));
  router.get("/summary", asyncHandler(controller.getSummary));
  router.get("/approvals", asyncHandler(controller.listApprovals));
  router.get("/", asyncHandler(controller.listExpenses));
  router.get("/:id", asyncHandler(controller.getExpense));
  router.post("/", asyncHandler(controller.createExpense));
  router.put("/:id", asyncHandler(controller.updateExpense));
  router.patch("/:id/status", asyncHandler(controller.updateExpenseStatus));
  router.delete("/:id", asyncHandler(controller.deleteExpense));

  return router;
}
