export type FuelType = "petrol" | "diesel" | "cng" | "electric" | "other";

export type VehicleStatus = "available" | "assigned" | "maintenance" | "inactive";

export interface Vehicle {
  id: string;
  registration_number: string;
  vin: string | null;
  make: string;
  model: string;
  year: number;
  fuel_type: FuelType;
  vehicle_type: string | null;
  color: string | null;
  seating_capacity: number;
  status: VehicleStatus;
  current_odometer: number;
  insurance_number: string | null;
  insurance_expiry: string | null;
  rc_number: string | null;
  registration_expiry: string | null;
  puc_expiry: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  assigned_driver_name: string | null;
  created_at: string;
  updated_at: string;
}

export type VehicleFormData = {
  registration_number: string;
  vin: string;
  make: string;
  model: string;
  year: string;
  fuel_type: FuelType;
  vehicle_type: string;
  color: string;
  seating_capacity: string;
  current_odometer: string;
  insurance_number: string;
  insurance_expiry: string;
  rc_number: string;
  registration_expiry: string;
  puc_expiry: string;
  status: VehicleStatus;
};

export interface VehicleFilters {
  search: string;
  status: VehicleStatus | "all";
  fuel_type: FuelType | "all";
  sort: "newest" | "oldest";
}

export type VehicleModalType = "add" | "edit" | "view" | "delete" | null;
