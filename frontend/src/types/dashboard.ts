export interface DashboardMetric {
  id: string;
  value: number;
  format: "number" | "currency" | "percent";
  label?: string;
}

export interface DashboardDatum {
  label: string;
  value: number;
  [key: string]: unknown;
}

export interface DashboardFilters {
  date_from?: string;
  date_to?: string;
  vehicle_id?: string;
  driver_id?: string;
  trip_id?: string;
  region?: string;
  fuel_type?: string;
}

export interface DashboardResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardFilterMetadata {
  vehicles: Array<{ id: string; registration_number: string; vehicle_name: string }>;
  drivers: Array<{ id: string; full_name: string }>;
  trips: Array<{ id: string; origin: string; destination: string }>;
  regions: string[];
  fuel_types: string[];
}

export interface DashboardOverviewData {
  kpis: DashboardMetric[];
}

export interface DashboardFleetData {
  fleet_status: DashboardDatum[];
  vehicle_utilization: Array<{ id: string; label: string; vehicle_name: string; value: number }>;
  vehicle_distribution: DashboardDatum[];
  most_used_vehicle: { id: string; registration_number: string; vehicle_name: string; trip_count: number } | null;
  least_used_vehicle: { id: string; registration_number: string; vehicle_name: string; trip_count: number } | null;
  average_distance: number;
}

export interface DashboardTripsData {
  summary: Record<string, number>;
  trips_by_vehicle: DashboardDatum[];
  trips_by_driver: DashboardDatum[];
  trips_by_region: DashboardDatum[];
}

export interface DashboardDriversData {
  summary: Record<string, number>;
  license_expiring: Array<{ id: string; full_name: string; license_number: string; license_expiry: string }>;
  trips_per_driver: DashboardDatum[];
  distance_per_driver: DashboardDatum[];
}

export interface DashboardFuelData {
  summary: Record<string, number>;
  fuel_spending_trend: DashboardDatum[];
  fuel_consumption_trend: DashboardDatum[];
  fuel_cost_by_vehicle: DashboardDatum[];
  fuel_cost_by_driver: DashboardDatum[];
  fuel_cost_by_city: DashboardDatum[];
  fuel_type_distribution: DashboardDatum[];
  recent_fuel_logs: Array<{
    id: string;
    fuel_station_name: string;
    city: string | null;
    total_cost: number;
    quantity: number;
    filled_at: string;
    registration_number: string;
    driver_name: string;
  }>;
}

export interface DashboardExpensesData {
  summary: Record<string, number>;
  expense_trend: DashboardDatum[];
  expense_breakdown: DashboardDatum[];
  expense_by_vehicle: DashboardDatum[];
}

export interface DashboardMaintenanceData {
  summary: Record<string, number>;
  most_serviced_vehicles: DashboardDatum[];
}

export interface DashboardFinanceData {
  summary: Record<string, number>;
  expense_distribution: DashboardDatum[];
}

export interface DashboardLiveData {
  vehicles_currently_on_trip: Array<{
    id: string;
    registration_number: string;
    vehicle_name: string;
    origin: string;
    destination: string;
    scheduled_end: string;
  }>;
  drivers_active: Array<{ id: string; full_name: string; status: string }>;
  summary: Record<string, number>;
}

export interface DashboardNotificationsData {
  feed: Array<{ id: string; title: string; message: string; status: string; created_at: string }>;
  maintenance_due: Array<{ id: string; registration_number: string; type: string; scheduled_date: string }>;
  insurance_expiring: Array<{ id: string; registration_number: string; insurance_expiry: string }>;
  license_expiring: Array<{ id: string; full_name: string; license_expiry: string }>;
  vehicle_offline: Array<{ id: string; registration_number: string; status: string }>;
  trip_delays: Array<{ id: string; registration_number: string; origin: string; destination: string; scheduled_end: string }>;
}
