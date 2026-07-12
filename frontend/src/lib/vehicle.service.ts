import type { Vehicle, VehicleFormData, VehicleFilters } from "@/types/vehicle";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

function mapBackendVehicle(raw: Record<string, unknown>): Vehicle {
  return {
    id: raw.id as string,
    registration_number: raw.registration_number as string,
    vin: (raw.vin as string) ?? null,
    make: raw.make as string,
    model: raw.model as string,
    year: raw.year as number,
    fuel_type: (raw.fuel_type as Vehicle["fuel_type"]) || "other",
    vehicle_type: (raw.vehicle_type as string) ?? null,
    color: (raw.color as string) ?? null,
    seating_capacity: (raw.seating_capacity as number) ?? 0,
    status: (raw.status as Vehicle["status"]) || "available",
    current_odometer: (raw.current_odometer as number) ?? 0,
    insurance_number: null,
    insurance_expiry: (raw.insurance_expiry as string) ?? null,
    rc_number: null,
    registration_expiry: (raw.registration_expiry as string) ?? null,
    puc_expiry: null,
    last_maintenance_date: (raw.last_maintenance_date as string) ?? null,
    next_maintenance_date: (raw.next_maintenance_date as string) ?? null,
    assigned_driver_name: null,
    created_at: (raw.created_at as string) ?? new Date().toISOString(),
    updated_at: (raw.updated_at as string) ?? new Date().toISOString(),
  };
}

const mockVehicles: Vehicle[] = [
  {
    id: "mock-1",
    registration_number: "MH-12-AB-1234",
    vin: "VIN11111111111111",
    make: "Toyota",
    model: "Hiace",
    year: 2022,
    fuel_type: "diesel",
    vehicle_type: "Minibus",
    color: "White",
    seating_capacity: 12,
    status: "available",
    current_odometer: 45000,
    insurance_number: "INS-1234",
    insurance_expiry: "2026-12-31",
    rc_number: "RC-2022-001",
    registration_expiry: "2027-06-15",
    puc_expiry: "2026-09-20",
    last_maintenance_date: "2026-01-15",
    next_maintenance_date: "2026-07-15",
    assigned_driver_name: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "mock-2",
    registration_number: "DL-12-CD-5678",
    vin: "VIN22222222222222",
    make: "Volvo",
    model: "9400",
    year: 2021,
    fuel_type: "diesel",
    vehicle_type: "Bus",
    color: "Blue",
    seating_capacity: 45,
    status: "available",
    current_odometer: 78000,
    insurance_number: "INS-5678",
    insurance_expiry: "2026-11-30",
    rc_number: "RC-2021-002",
    registration_expiry: "2027-08-20",
    puc_expiry: "2026-10-15",
    last_maintenance_date: "2026-02-20",
    next_maintenance_date: "2026-08-20",
    assigned_driver_name: "Rajesh Kumar",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "mock-3",
    registration_number: "MH-14-EF-9012",
    vin: "VIN33333333333333",
    make: "Tata",
    model: "Winger",
    year: 2023,
    fuel_type: "cng",
    vehicle_type: "Minibus",
    color: "Silver",
    seating_capacity: 15,
    status: "available",
    current_odometer: 22000,
    insurance_number: "INS-9012",
    insurance_expiry: "2027-03-10",
    rc_number: "RC-2023-003",
    registration_expiry: "2028-01-10",
    puc_expiry: "2027-02-28",
    last_maintenance_date: "2025-12-10",
    next_maintenance_date: "2026-06-10",
    assigned_driver_name: "Priya Sharma",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "mock-4",
    registration_number: "KA-03-GH-3456",
    vin: "VIN44444444444444",
    make: "Mahindra",
    model: "Supro",
    year: 2020,
    fuel_type: "electric",
    vehicle_type: "Van",
    color: "White",
    seating_capacity: 8,
    status: "maintenance",
    current_odometer: 35000,
    insurance_number: "INS-3456",
    insurance_expiry: "2026-08-25",
    rc_number: "RC-2020-004",
    registration_expiry: "2027-04-05",
    puc_expiry: "2026-07-30",
    last_maintenance_date: "2026-04-05",
    next_maintenance_date: "2026-06-05",
    assigned_driver_name: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: "mock-5",
    registration_number: "HR-55-IJ-7890",
    vin: "VIN55555555555555",
    make: "Force",
    model: "Traveller",
    year: 2019,
    fuel_type: "diesel",
    vehicle_type: "Minibus",
    color: "Grey",
    seating_capacity: 17,
    status: "inactive",
    current_odometer: 92000,
    insurance_number: "INS-7890",
    insurance_expiry: "2026-05-15",
    rc_number: "RC-2019-005",
    registration_expiry: "2027-02-18",
    puc_expiry: "2026-04-10",
    last_maintenance_date: "2025-08-15",
    next_maintenance_date: "2025-08-15",
    assigned_driver_name: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
  },
];

let mockNextId = 6;

function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_API_BASE_URL;
}

export const vehicleService = {
  async list(filters?: Partial<VehicleFilters>): Promise<Vehicle[]> {
    if (isMockMode()) {
      let result = [...mockVehicles];

      if (filters) {
        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter(
            (v) =>
              v.registration_number.toLowerCase().includes(q) ||
              v.vin?.toLowerCase().includes(q) ||
              v.make.toLowerCase().includes(q) ||
              v.model.toLowerCase().includes(q),
          );
        }

        if (filters.status && filters.status !== "all") {
          result = result.filter((v) => v.status === filters.status);
        }

        if (filters.fuel_type && filters.fuel_type !== "all") {
          result = result.filter((v) => v.fuel_type === filters.fuel_type);
        }

        if (filters.sort === "newest") {
          result.sort((a, b) => b.year - a.year);
        } else if (filters.sort === "oldest") {
          result.sort((a, b) => a.year - b.year);
        }
      }

      return result;
    }

    const res = await fetch(`${API_BASE_URL}/vehicles`);
    if (!res.ok) {
      throw new Error("Failed to load vehicles");
    }
    const raw = (await res.json()) as Record<string, unknown>[];
    return raw.map(mapBackendVehicle);
  },

  async getById(id: string): Promise<Vehicle> {
    if (isMockMode()) {
      const v = mockVehicles.find((m) => m.id === id);
      if (!v) throw new Error("Vehicle not found");
      return { ...v };
    }

    const res = await fetch(`${API_BASE_URL}/vehicles/${id}`);
    if (!res.ok) throw new Error("Vehicle not found");
    const raw = (await res.json()) as Record<string, unknown>;
    return mapBackendVehicle(raw);
  },

  async create(data: VehicleFormData): Promise<Vehicle> {
    const vehicle: Vehicle = {
      id: `mock-${mockNextId++}`,
      registration_number: data.registration_number,
      vin: data.vin || null,
      make: data.make,
      model: data.model,
      year: Number(data.year),
      fuel_type: data.fuel_type,
      vehicle_type: data.vehicle_type || null,
      color: data.color || null,
      seating_capacity: Number(data.seating_capacity) || 0,
      status: data.status,
      current_odometer: Number(data.current_odometer) || 0,
      insurance_number: data.insurance_number || null,
      insurance_expiry: data.insurance_expiry || null,
      rc_number: data.rc_number || null,
      registration_expiry: data.registration_expiry || null,
      puc_expiry: data.puc_expiry || null,
      last_maintenance_date: null,
      next_maintenance_date: null,
      assigned_driver_name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isMockMode()) {
      mockVehicles.push(vehicle);
      return { ...vehicle };
    }

    const res = await fetch(`${API_BASE_URL}/vehicles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create vehicle");
    const raw = (await res.json()) as Record<string, unknown>;
    return mapBackendVehicle(raw);
  },

  async update(id: string, data: Partial<VehicleFormData>): Promise<Vehicle> {
    if (isMockMode()) {
      const idx = mockVehicles.findIndex((m) => m.id === id);
      if (idx === -1) throw new Error("Vehicle not found");

      const updated: Vehicle = {
        ...mockVehicles[idx],
        ...(data.registration_number !== undefined && { registration_number: data.registration_number }),
        ...(data.vin !== undefined && { vin: data.vin || null }),
        ...(data.make !== undefined && { make: data.make }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.year !== undefined && { year: Number(data.year) }),
        ...(data.fuel_type !== undefined && { fuel_type: data.fuel_type }),
        ...(data.vehicle_type !== undefined && { vehicle_type: data.vehicle_type || null }),
        ...(data.color !== undefined && { color: data.color || null }),
        ...(data.seating_capacity !== undefined && { seating_capacity: Number(data.seating_capacity) }),
        ...(data.current_odometer !== undefined && { current_odometer: Number(data.current_odometer) }),
        ...(data.insurance_number !== undefined && { insurance_number: data.insurance_number || null }),
        ...(data.insurance_expiry !== undefined && { insurance_expiry: data.insurance_expiry || null }),
        ...(data.rc_number !== undefined && { rc_number: data.rc_number || null }),
        ...(data.registration_expiry !== undefined && { registration_expiry: data.registration_expiry || null }),
        ...(data.puc_expiry !== undefined && { puc_expiry: data.puc_expiry || null }),
        ...(data.status !== undefined && { status: data.status }),
        updated_at: new Date().toISOString(),
      };

      mockVehicles[idx] = updated;
      return { ...updated };
    }

    const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update vehicle");
    const raw = (await res.json()) as Record<string, unknown>;
    return mapBackendVehicle(raw);
  },

  async remove(id: string): Promise<void> {
    if (isMockMode()) {
      const idx = mockVehicles.findIndex((m) => m.id === id);
      if (idx !== -1) mockVehicles.splice(idx, 1);
      return;
    }

    const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete vehicle");
  },
};
