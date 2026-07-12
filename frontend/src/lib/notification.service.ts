import { NotificationCenterData } from "@/types/notification-center";

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
    throw new Error(payload.message || "Notification request failed.");
  }
  return payload.data;
}

export const notificationService = {
  list() {
    return request<NotificationCenterData>("/api/notifications");
  },
  markAsRead(id: string) {
    return request(`/api/notifications/${id}/read`, { method: "PATCH" });
  },
  markAllAsRead() {
    return request("/api/notifications/mark-all-read", { method: "PATCH" });
  },
  remove(id: string) {
    return request(`/api/notifications/${id}`, { method: "DELETE" });
  },
};
