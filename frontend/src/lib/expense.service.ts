import { ExpenseMetadata, ExpenseRecord, ExpenseSummary, ExpenseUpsertInput } from "@/types/expense";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

async function request<T>(path: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
      ...init,
    });
  } catch (err: any) {
    throw new Error(err?.message || "Network error. Unable to connect to server.");
  }

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || payload.success === false) {
    const errorMsg = payload.message || payload.error?.message || `Request failed with status ${response.status}.`;
    throw new Error(errorMsg);
  }
  return (payload.data !== undefined ? payload.data : payload) as T;
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
