export type ExpenseCategory =
  | "fuel"
  | "toll"
  | "maintenance"
  | "repair"
  | "insurance"
  | "salary"
  | "parking"
  | "permit"
  | "taxes"
  | "driver_allowance"
  | "food"
  | "hotel"
  | "office_expenses"
  | "miscellaneous"
  | "other";

export type ExpenseStatus = "pending" | "approved" | "rejected" | "paid";

export interface ExpenseRecord {
  id: string;
  vehicle_id: string;
  driver_id: string | null;
  trip_id: string | null;
  category: ExpenseCategory;
  expense_category: ExpenseCategory;
  amount: number;
  tax: number;
  discount: number;
  total_amount: number;
  description: string | null;
  vendor_name: string | null;
  vendor_contact: string | null;
  vendor_gst: string | null;
  invoice_number: string | null;
  receipt_number: string | null;
  receipt_image: string | null;
  vendor: string | null;
  payment_method: string | null;
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  expense_status: ExpenseStatus;
  remarks: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
  registration_number: string;
  vehicle_name: string;
  driver_name: string | null;
  origin: string | null;
  destination: string | null;
}

export interface ExpenseMetadata {
  vehicles: Array<{ id: string; registration_number: string; vehicle_name: string }>;
  drivers: Array<{ id: string; full_name: string }>;
  trips: Array<{ id: string; origin: string; destination: string }>;
  categories: ExpenseCategory[];
  payment_methods: string[];
  statuses: ExpenseStatus[];
  approvers: Array<{ id: string; full_name: string; role: string }>;
}

export interface ExpenseUpsertInput {
  vehicle_id: string;
  driver_id?: string;
  trip_id?: string;
  category: ExpenseCategory;
  expense_category?: ExpenseCategory;
  amount: number;
  tax?: number;
  discount?: number;
  total_amount?: number;
  description?: string;
  vendor_name?: string;
  vendor_contact?: string;
  vendor_gst?: string;
  invoice_number?: string;
  receipt_number?: string;
  receipt_image?: string;
  vendor?: string;
  payment_method?: string;
  approved_by?: string;
  approved_at?: string;
  expense_status?: ExpenseStatus;
  remarks?: string;
  expense_date: string;
}

export interface ExpenseSummary {
  summary: Record<string, number>;
  monthly_trend: Array<{ label: string; value: number }>;
  by_category: Array<{ label: string; value: number }>;
  by_vehicle: Array<{ label: string; value: number }>;
  by_driver: Array<{ label: string; value: number }>;
  top_vendors: Array<{ label: string; value: number }>;
}
