export const expenseCategories = [
  "fuel",
  "toll",
  "maintenance",
  "repair",
  "insurance",
  "salary",
  "parking",
  "permit",
  "taxes",
  "driver_allowance",
  "food",
  "hotel",
  "office_expenses",
  "miscellaneous",
  "other",
] as const;

export const expensePaymentMethods = ["cash", "card", "upi", "fleet_card", "bank_transfer", "other"] as const;
export const expenseStatuses = ["pending", "approved", "rejected", "paid"] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];
export type ExpensePaymentMethod = (typeof expensePaymentMethods)[number];
export type ExpenseStatus = (typeof expenseStatuses)[number];

export interface ExpensePayload {
  vehicle_id: string;
  driver_id?: string | null;
  trip_id?: string | null;
  category?: ExpenseCategory;
  expense_category?: ExpenseCategory;
  vendor_name?: string | null;
  vendor_contact?: string | null;
  vendor_gst?: string | null;
  invoice_number?: string | null;
  amount: number;
  tax?: number | null;
  discount?: number | null;
  total_amount?: number | null;
  description?: string | null;
  receipt_number?: string | null;
  receipt_image?: string | null;
  vendor?: string | null;
  payment_method?: ExpensePaymentMethod | null;
  expense_date: string;
  approved_by?: string | null;
  approved_at?: string | null;
  expense_status?: ExpenseStatus | null;
  remarks?: string | null;
  created_by?: string | null;
}
