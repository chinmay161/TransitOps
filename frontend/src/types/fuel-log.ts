export type FuelType = "petrol" | "diesel" | "cng" | "electric" | "other";
export type FuelUnit = "liters" | "gallons" | "kwh";
export type PaymentMethod = "cash" | "card" | "upi" | "fleet_card" | "other";

export interface FuelLog {
  id: string;
  vehicle_id: string;
  driver_id: string;
  trip_id: string | null;
  fuel_station_name: string;
  fuel_station_address: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  fuel_type: FuelType;
  quantity: number;
  unit: FuelUnit;
  price_per_unit: number;
  total_cost: number;
  currency: string;
  odometer: number;
  payment_method: PaymentMethod;
  receipt_number: string | null;
  receipt_image: string | null;
  remarks: string | null;
  filled_at: string;
  created_at: string;
  updated_at: string;
  vehicle_registration_number: string;
  vehicle_name: string;
  vehicle_status: string;
  vehicle_current_odometer: number;
  driver_name: string;
  driver_license_number: string;
  driver_status: string;
  trip_status: string | null;
  trip_origin: string | null;
  trip_destination: string | null;
}

export interface FuelLogListResponse {
  items: FuelLog[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface FuelLogFormValues {
  vehicle_id: string;
  driver_id: string;
  trip_id: string;
  fuel_station_name: string;
  fuel_station_address: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
  fuel_type: FuelType;
  quantity: number;
  unit: FuelUnit;
  price_per_unit: number;
  total_cost: number;
  currency: string;
  odometer: number;
  payment_method: PaymentMethod;
  receipt_number: string;
  receipt_image: string;
  remarks: string;
  filled_at: string;
  total_cost_override: boolean;
}

export interface FuelLogMetadata {
  vehicles: Array<{
    id: string;
    registration_number: string;
    vehicle_name: string;
    fuel_type: FuelType;
    current_odometer: number;
    status: string;
  }>;
  drivers: Array<{
    id: string;
    driver_name: string;
    license_number: string;
    status: string;
  }>;
  trips: Array<{
    id: string;
    vehicle_id: string;
    driver_id: string;
    status: string;
    origin: string;
    destination: string;
  }>;
  stations: Array<{
    fuel_station_name: string;
    fuel_station_address: string | null;
    city: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
  }>;
  fuel_types: FuelType[];
  units: FuelUnit[];
  payment_methods: PaymentMethod[];
  currencies: string[];
}

export interface FuelLogFilters {
  page?: number;
  per_page?: number;
  vehicle_id?: string;
  driver_id?: string;
  trip_id?: string;
  fuel_type?: string;
  city?: string;
  state?: string;
  date_from?: string;
  date_to?: string;
  q?: string;
  sort?: string;
}

export interface PriceSuggestionResponse {
  price: number | null;
  source: string | null;
  manual_required: boolean;
  message: string;
}
