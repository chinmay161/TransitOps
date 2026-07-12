export interface DashboardFilters {
  date_from?: string;
  date_to?: string;
  vehicle_id?: string;
  driver_id?: string;
  trip_id?: string;
  region?: string;
  fuel_type?: string;
  role?: string;
}

export interface QueryPart {
  clause: string;
  values: Array<string | number>;
}
