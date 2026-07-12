import { GeneratedReport, ReportHistoryRecord } from "@/types/report";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

function toQuery(params: Record<string, string>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return search.toString();
}

export async function fetchReport(type: string, filters: Record<string, string>) {
  const query = toQuery(filters);
  const response = await fetch(`${API_BASE_URL}/api/reports/${type}${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to load report.");
  }
  return payload.data as GeneratedReport;
}

export async function fetchReportHistory() {
  const response = await fetch(`${API_BASE_URL}/api/reports/history`, { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to load report history.");
  }
  return payload.data as ReportHistoryRecord[];
}

export async function updateReportFavorite(id: string, isFavorite: boolean) {
  const response = await fetch(`${API_BASE_URL}/api/reports/history/${id}/favorite`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_favorite: isFavorite }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to update report favorite.");
  }
  return payload.data as ReportHistoryRecord;
}

export async function deleteReportHistory(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/reports/history/${id}`, { method: "DELETE" });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to delete report history.");
  }
  return payload.data as { id: string };
}

export function getReportExportUrl(type: string, filters: Record<string, string>, format: "csv" | "pdf") {
  const query = toQuery({ ...filters, format });
  return `${API_BASE_URL}/api/reports/${type}?${query}`;
}
