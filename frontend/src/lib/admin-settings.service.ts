import { AdminSettings, AdminSettingsUpdateInput, AuditLogEntry } from "@/types/admin-settings";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Admin settings request failed.");
  }
  return payload.data;
}

export const adminSettingsService = {
  get() {
    return request<AdminSettings>("/api/admin-settings");
  },
  update(body: AdminSettingsUpdateInput) {
    return request<AdminSettings>("/api/admin-settings", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },
  auditLogs() {
    return request<AuditLogEntry[]>("/api/admin-settings/audit-logs");
  },
};
