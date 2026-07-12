export const fuelTypes = ["petrol", "diesel", "cng", "electric", "other"] as const;
export const fuelUnits = ["liters", "gallons", "kwh"] as const;
export const paymentMethods = ["cash", "card", "upi", "fleet_card", "other"] as const;

export type FuelType = (typeof fuelTypes)[number];
export type FuelUnit = (typeof fuelUnits)[number];
export type PaymentMethod = (typeof paymentMethods)[number];

export interface FuelLogRecord {
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

export interface FuelLogPayload {
  vehicle_id: string;
  driver_id: string;
  trip_id?: string | null;
  fuel_station_name: string;
  fuel_station_address?: string | null;
  city?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  fuel_type: FuelType;
  quantity: number;
  unit: FuelUnit;
  price_per_unit: number;
  total_cost?: number | null;
  currency: string;
  odometer: number;
  payment_method: PaymentMethod;
  receipt_number?: string | null;
  receipt_image?: string | null;
  remarks?: string | null;
  filled_at: string;
  total_cost_override?: boolean;
}

export interface FuelLogListParams {
  page: number;
  per_page: number;
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
