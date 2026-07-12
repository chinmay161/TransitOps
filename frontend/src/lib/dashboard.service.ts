import {
  DashboardDriversData,
  DashboardExpensesData,
  DashboardFilterMetadata,
  DashboardFilters,
  DashboardFinanceData,
  DashboardFleetData,
  DashboardFuelData,
  DashboardLiveData,
  DashboardNotificationsData,
  DashboardOverviewData,
  DashboardResponse,
  DashboardTripsData,
  DashboardMaintenanceData,
} from "@/types/dashboard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

function toQueryString(filters: DashboardFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  return params.toString();
}

async function request<T>(path: string, filters: DashboardFilters = {}) {
  try {
    const query = toQueryString(filters);
    const response = await fetch(`${API_BASE_URL}${path}${query ? `?${query}` : ""}`, {
      cache: "no-store",
    });
    const payload = (await response.json()) as DashboardResponse<T>;
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Dashboard request failed.");
    }

    return payload.data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Backend API is unavailable at ${API_BASE_URL}. Start PostgreSQL and the backend server, then retry.`,
      );
    }

    throw error;
  }
}

export async function fetchDashboardBundle(filters: DashboardFilters) {
  const [
    overview,
    fleet,
    trips,
    drivers,
    fuel,
    expenses,
    maintenance,
    finance,
    live,
    notifications,
  ] = await Promise.all([
    request<DashboardOverviewData>("/api/dashboard/overview", filters),
    request<DashboardFleetData>("/api/dashboard/fleet", filters),
    request<DashboardTripsData>("/api/dashboard/trips", filters),
    request<DashboardDriversData>("/api/dashboard/drivers", filters),
    request<DashboardFuelData>("/api/dashboard/fuel", filters),
    request<DashboardExpensesData>("/api/dashboard/expenses", filters),
    request<DashboardMaintenanceData>("/api/dashboard/maintenance", filters),
    request<DashboardFinanceData>("/api/dashboard/finance", filters),
    request<DashboardLiveData>("/api/dashboard/live", filters),
    request<DashboardNotificationsData>("/api/dashboard/notifications", filters),
  ]);

  return {
    overview,
    fleet,
    trips,
    drivers,
    fuel,
    expenses,
    maintenance,
    finance,
    live,
    notifications,
  };
}

export async function fetchDashboardFilterMetadata() {
  return request<DashboardFilterMetadata>("/api/dashboard/filters");
}

export async function fetchRoleDashboard(role: string, filters: DashboardFilters) {
  return request<Record<string, unknown>>(`/api/dashboard/role/${role}`, filters);
}
