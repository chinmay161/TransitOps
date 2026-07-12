import { ExpenseMetadata, ExpenseRecord, ExpenseSummary, ExpenseUpsertInput } from "@/types/expense";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
    ...init,
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed.");
  }
  return payload.data;
}

export const expenseService = {
  getMetadata() {
    return request<ExpenseMetadata>("/api/expenses/metadata");
  },
  getSummary(query = "") {
    return request<ExpenseSummary>(`/api/expenses/summary${query ? `?${query}` : ""}`);
  },
  list(query = "") {
    return request<ExpenseRecord[]>(`/api/expenses${query ? `?${query}` : ""}`);
  },
  listApprovals(query = "") {
    return request<ExpenseRecord[]>(`/api/expenses/approvals${query ? `?${query}` : ""}`);
  },
  getById(id: string) {
    return request<ExpenseRecord>(`/api/expenses/${id}`);
  },
  create(body: ExpenseUpsertInput) {
    return request<ExpenseRecord>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  update(id: string, body: ExpenseUpsertInput) {
    return request<ExpenseRecord>(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  updateStatus(id: string, body: { expense_status: string; approved_by?: string; remarks?: string }) {
    return request<ExpenseRecord>(`/api/expenses/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  remove(id: string) {
    return request<{ id: string }>(`/api/expenses/${id}`, { method: "DELETE" });
  },
};
