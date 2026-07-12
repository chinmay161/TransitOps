import {
  FuelLog,
  FuelLogFilters,
  FuelLogFormValues,
  FuelLogListResponse,
  FuelLogMetadata,
  PriceSuggestionResponse,
} from "@/types/fuel-log";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: FuelLogListResponse["meta"];
}

function buildQuery(filters: FuelLogFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

export const fuelLogService = {
  async list(filters: FuelLogFilters = {}): Promise<FuelLogListResponse> {
    const query = buildQuery(filters);
    const payload = await request<FuelLog[]>(`/api/fuel-logs${query ? `?${query}` : ""}`);
    return {
      items: payload.data,
      meta: payload.meta || {
        page: 1,
        per_page: 10,
        total: payload.data.length,
        total_pages: 1,
      },
    };
  },

  async getById(id: string): Promise<FuelLog> {
    const payload = await request<FuelLog>(`/api/fuel-logs/${id}`);
    return payload.data;
  },

  async getMetadata(vehicleId?: string): Promise<FuelLogMetadata> {
    const query = vehicleId ? `?vehicle_id=${encodeURIComponent(vehicleId)}` : "";
    const payload = await request<FuelLogMetadata>(`/api/fuel-logs/metadata${query}`);
    return payload.data;
  },

  async create(values: FuelLogFormValues): Promise<FuelLog> {
    const payload = await request<FuelLog>("/api/fuel-logs", {
      method: "POST",
      body: JSON.stringify(values),
    });
    return payload.data;
  },

  async update(id: string, values: FuelLogFormValues): Promise<FuelLog> {
    const payload = await request<FuelLog>(`/api/fuel-logs/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    return payload.data;
  },

  async remove(id: string): Promise<void> {
    await request(`/api/fuel-logs/${id}`, { method: "DELETE" });
  },

  async getPriceSuggestion(values: {
    fuel_station_name: string;
    city?: string;
    state?: string;
    fuel_type: string;
  }): Promise<PriceSuggestionResponse> {
    const payload = await request<PriceSuggestionResponse>("/api/fuel-logs/price-suggestion", {
      method: "POST",
      body: JSON.stringify(values),
    });
    return payload.data;
  },
};
