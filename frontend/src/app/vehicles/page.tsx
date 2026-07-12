"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import {
  MagnifyingGlass,
  Funnel,
  Plus,
  Eye,
  Pencil,
  Trash,
  CaretLeft,
  CheckCircle,
  Warning,
  XCircle,
  Calendar,
  User,
  X,
  SteeringWheel,
  GasPump,
  ArrowsClockwise,
  ShieldCheck,
} from "@phosphor-icons/react";
import Link from "next/link";
import { vehicleService } from "@/lib/vehicle.service";
import type {
  Vehicle,
  VehicleFormData,
  VehicleFilters,
  VehicleModalType,
  FuelType,
  VehicleStatus,
} from "@/types/vehicle";

const API_URL = "http://localhost:5000";

const currentYear = new Date().getFullYear();

const vehicleSchema = z.object({
  registration_number: z.string().min(1, "Registration number is required"),
  vin: z.string(),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .string()
    .min(1, "Year is required")
    .refine(
      (val) => {
        const n = Number(val);
        return !isNaN(n) && n >= 2000 && n <= currentYear + 1;
      },
      { message: `Year must be between 2000 and ${currentYear + 1}` },
    ),
  fuel_type: z.string().min(1, "Fuel type is required").refine(
    (val) => ["petrol", "diesel", "cng", "electric", "other"].includes(val),
    { message: "Invalid fuel type" },
  ),
  vehicle_type: z.string(),
  color: z.string(),
  seating_capacity: z.string(),
  current_odometer: z
    .string()
    .min(1, "Current odometer is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Odometer must be 0 or greater",
    }),
  insurance_number: z.string(),
  insurance_expiry: z.string().refine(
    (val) => {
      if (!val) return true;
      return new Date(val) >= new Date(new Date().toDateString());
    },
    { message: "Insurance expiry cannot be before today" },
  ),
  rc_number: z.string(),
  registration_expiry: z.string().refine(
    (val) => {
      if (!val) return true;
      return new Date(val) >= new Date(new Date().toDateString());
    },
    { message: "Registration expiry cannot be before today" },
  ),
  puc_expiry: z.string().refine(
    (val) => {
      if (!val) return true;
      return new Date(val) >= new Date(new Date().toDateString());
    },
    { message: "PUC expiry cannot be before today" },
  ),
  status: z.string().min(1, "Status is required").refine(
    (val) => ["available", "assigned", "maintenance", "inactive"].includes(val),
    { message: "Invalid status" },
  ),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface Toast {
  type: "success" | "error" | "warning";
  message: string;
  id: number;
}

export default function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">("all");
  const [fuelFilter, setFuelFilter] = useState<FuelType | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [activeModal, setActiveModal] = useState<VehicleModalType>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registration_number: "",
      vin: "",
      make: "",
      model: "",
      year: "",
      fuel_type: "diesel",
      vehicle_type: "",
      color: "",
      seating_capacity: "",
      current_odometer: "",
      insurance_number: "",
      insurance_expiry: "",
      rc_number: "",
      registration_expiry: "",
      puc_expiry: "",
      status: "available",
    },
  });

  const watchedInsuranceExpiry = watch("insurance_expiry");
  const watchedRegistrationExpiry = watch("registration_expiry");
  const watchedPucExpiry = watch("puc_expiry");

  const loadVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Partial<VehicleFilters> = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (fuelFilter !== "all") filters.fuel_type = fuelFilter;
      filters.sort = sortOrder;
      const data = await vehicleService.list(filters);
      setVehicles(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      console.error(err);
      setError(message);
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVehicles();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fuelFilter, sortOrder]);

  const showToast = (type: "success" | "error" | "warning", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { type, message, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isExpiringSoon = (dateStr: string | null) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDays = new Date(today);
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return date >= today && date <= thirtyDays;
  };

  const activeCount = vehicles.filter(
    (v) => v.status === "available" || v.status === "assigned",
  ).length;
  const maintenanceCount = vehicles.filter((v) => v.status === "maintenance").length;
  const inactiveCount = vehicles.filter((v) => v.status === "inactive").length;
  const expiringRegistrationsCount = vehicles.filter(
    (v) => v.registration_expiry && isExpiringSoon(v.registration_expiry),
  ).length;

  const onAddSubmit = async (formData: VehicleFormValues) => {
    try {
      const vehicle = await vehicleService.create(formData as VehicleFormData);
      showToast("success", `Vehicle ${formData.registration_number} added successfully.`);
      setActiveModal(null);
      reset();
      setVehicles((prev) => [...prev, vehicle]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create vehicle";
      showToast("error", message);
    }
  };

  const onEditSubmit = async (formData: VehicleFormValues) => {
    if (!selectedVehicle) return;
    try {
      const updated = await vehicleService.update(
        selectedVehicle.id,
        formData as unknown as Partial<VehicleFormData>,
      );
      showToast("success", `Vehicle ${formData.registration_number} updated successfully.`);
      setActiveModal(null);
      setSelectedVehicle(null);
      reset();
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update vehicle";
      showToast("error", message);
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    try {
      await vehicleService.remove(selectedVehicle.id);
      showToast("success", "Vehicle deleted successfully.");
      setActiveModal(null);
      setSelectedVehicle(null);
      setVehicles((prev) => prev.filter((v) => v.id !== selectedVehicle.id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete vehicle";
      showToast("error", message);
    }
  };

  const openModal = (type: VehicleModalType, vehicle?: Vehicle) => {
    setSelectedVehicle(vehicle || null);
    setActiveModal(type);

    if (type === "edit" && vehicle) {
      setValue("registration_number", vehicle.registration_number);
      setValue("vin", vehicle.vin || "");
      setValue("make", vehicle.make);
      setValue("model", vehicle.model);
      setValue("year", String(vehicle.year));
      setValue("fuel_type", vehicle.fuel_type);
      setValue("vehicle_type", vehicle.vehicle_type || "");
      setValue("color", vehicle.color || "");
      setValue("seating_capacity", vehicle.seating_capacity ? String(vehicle.seating_capacity) : "");
      setValue("current_odometer", String(vehicle.current_odometer));
      setValue("insurance_number", vehicle.insurance_number || "");
      setValue("insurance_expiry", vehicle.insurance_expiry || "");
      setValue("rc_number", vehicle.rc_number || "");
      setValue("registration_expiry", vehicle.registration_expiry || "");
      setValue("puc_expiry", vehicle.puc_expiry || "");
      setValue("status", vehicle.status);
    } else if (type === "add") {
      reset({
        registration_number: "",
        vin: "",
        make: "",
        model: "",
        year: "",
        fuel_type: "diesel",
        vehicle_type: "",
        color: "",
        seating_capacity: "",
        current_odometer: "",
        insurance_number: "",
        insurance_expiry: "",
        rc_number: "",
        registration_expiry: "",
        puc_expiry: "",
        status: "available",
      });
    }
  };

  const formatOdometer = (val: number) => {
    return val.toLocaleString("en-IN");
  };

  return (
    <div className="min-h-screen bg-[#070D1A] text-[#F0F4FF] dot-grid relative pb-16">
      <header className="sticky top-0 z-40 bg-[#070D1A]/90 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group text-decoration-none">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#D4891A] flex items-center justify-center shadow-md">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="8" width="11" height="7" rx="1.5" fill="white" fillOpacity="0.95" />
              <path d="M12 10h3.5l2.5 3v2H12V10z" fill="white" fillOpacity="0.85" />
              <circle cx="5" cy="15.5" r="1.5" fill="#D4891A" />
              <circle cx="14.5" cy="15.5" r="1.5" fill="#D4891A" />
            </svg>
          </div>
          <span className="font-bold text-[#F0F4FF] tracking-tight group-hover:text-[#F5A623] transition-colors">
            TransitOps
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors font-medium"
          >
            <CaretLeft size={14} /> Back to Landing Page
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="flex border-b border-white/5 mb-8 gap-6 text-xs md:text-sm font-semibold">
          <a
            href="/drivers"
            className="pb-3 border-b-2 border-transparent text-[#6B7FA3] flex items-center gap-2 hover:text-[#F0F4FF] hover:border-white/10 transition-colors"
          >
            <User size={16} /> Drivers
          </a>
          <a
            href="/vehicles"
            className="pb-3 border-b-2 border-[#F5A623] text-[#F5A623] flex items-center gap-2 transition-colors"
          >
            <SteeringWheel size={16} /> Vehicles
          </a>
          <a
            href="/maintenance"
            className="pb-3 border-b-2 border-transparent text-[#6B7FA3] flex items-center gap-2 hover:text-[#F0F4FF] hover:border-white/10 transition-colors"
          >
            <Calendar size={16} /> Maintenance
          </a>
          <a
            href="/trips"
            className="pb-3 border-b-2 border-transparent text-[#6B7FA3] flex items-center gap-2 hover:text-[#F0F4FF] hover:border-white/10 transition-colors"
          >
            <ShieldCheck size={16} /> Trips
          </a>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F0F4FF] tracking-tight flex items-center gap-2.5">
              <SteeringWheel size={28} className="text-[#F5A623]" /> Vehicle Management
            </h1>
            <p className="text-xs md:text-sm text-[#6B7FA3] mt-1">
              Register, inspect, and manage your entire fleet inventory in one place.
            </p>
          </div>
          <button onClick={() => openModal("add")} className="btn-primary">
            <Plus size={18} weight="bold" /> Add Fleet Vehicle
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7FA3]">
              Total Vehicles
            </span>
            <div className="text-xl md:text-2xl font-black text-[#F0F4FF] mt-1">
              {loading ? "..." : vehicles.length}
            </div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#10B981]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#10B981]">
              Active
            </span>
            <div className="text-xl md:text-2xl font-black text-[#10B981] mt-1">
              {loading ? "..." : activeCount}
            </div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#f59e0b]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#f59e0b]">
              Under Maintenance
            </span>
            <div className="text-xl md:text-2xl font-black text-[#f59e0b] mt-1">
              {loading ? "..." : maintenanceCount}
            </div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#6B7FA3]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7FA3]">
              Out of Service
            </span>
            <div className="text-xl md:text-2xl font-black text-[#6B7FA3] mt-1">
              {loading ? "..." : inactiveCount}
            </div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#ef4444] col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#ef4444] flex items-center gap-1">
              <Warning size={12} /> Registrations Expiring
            </span>
            <div className="text-xl md:text-2xl font-black text-[#ef4444] mt-1">
              {loading ? "..." : expiringRegistrationsCount}
            </div>
          </div>
        </div>

        <div className="card-base bg-[#0D1526] p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:max-w-md">
            <MagnifyingGlass
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by registration, VIN, make, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-xs md:text-sm text-[#F0F4FF] placeholder-[#6B7FA3] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#6B7FA3] whitespace-nowrap">
              <Funnel size={16} /> Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | "all")}
              className="w-full md:w-36 bg-[#070D1A] border border-white/5 rounded-lg py-2.5 px-3.5 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="available">Active</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value as FuelType | "all")}
              className="w-full md:w-32 bg-[#070D1A] border border-white/5 rounded-lg py-2.5 px-3.5 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] cursor-pointer"
            >
              <option value="all">All Fuel</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="cng">CNG</option>
              <option value="electric">Electric</option>
              <option value="other">Other</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="w-full md:w-28 bg-[#070D1A] border border-white/5 rounded-lg py-2.5 px-3.5 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="card-base bg-[#0D1526] border-red-500/20 p-8 text-center">
            <Warning size={42} className="text-[#ef4444] mx-auto mb-3" />
            <h3 className="font-bold text-[#F0F4FF]">Server Connection Failure</h3>
            <p className="text-xs text-[#6B7FA3] max-w-md mx-auto mt-1 mb-4">
              We couldn&apos;t connect to the backend server. Make sure the API server is active on `{API_URL}`.
            </p>
            <button onClick={loadVehicles} className="btn-ghost text-xs">
              Retry Connection
            </button>
          </div>
        ) : loading ? (
          <div className="card-base bg-[#0D1526] p-1 divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/5" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-32 bg-white/5 rounded" />
                    <div className="h-2.5 w-44 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-3 w-24 bg-white/5 rounded hidden md:block" />
                <div className="h-3 w-16 bg-white/5 rounded" />
                <div className="h-8 w-24 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="card-base bg-[#0D1526] p-12 text-center">
            <SteeringWheel size={48} className="text-[#3A4F73] mx-auto mb-3" />
            <h3 className="font-bold text-[#F0F4FF]">No Vehicles Found</h3>
            <p className="text-xs text-[#6B7FA3] max-w-sm mx-auto mt-1">
              {searchTerm || statusFilter !== "all" || fuelFilter !== "all"
                ? "Try adjusting your search criteria or clearing filters."
                : "Your fleet is empty. Register your first vehicle to start managing your fleet inventory."}
            </p>
            {!searchTerm && statusFilter === "all" && fuelFilter === "all" && (
              <button onClick={() => openModal("add")} className="btn-primary mt-5">
                <Plus size={18} weight="bold" /> Add Fleet Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="card-base bg-[#0D1526] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold text-[#6B7FA3] uppercase tracking-wider bg-white/[0.01]">
                  <th className="py-4 px-5">Registration & Vehicle</th>
                  <th className="py-4 px-5">Type</th>
                  <th className="py-4 px-5">Assigned Driver</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Odometer</th>
                  <th className="py-4 px-5">Last Service</th>
                  <th className="py-4 px-5">Next Service</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs md:text-sm">
                {vehicles.map((vehicle) => {
                  const serviceOverdue =
                    vehicle.next_maintenance_date &&
                    isExpired(vehicle.next_maintenance_date);
                  return (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-white/[0.01] transition-colors group"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#162440] flex items-center justify-center text-[#F5A623] font-bold text-xs uppercase border border-white/5">
                            {vehicle.make.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-[#F0F4FF] group-hover:text-[#F5A623] transition-colors">
                              {vehicle.registration_number}
                            </div>
                            <div className="text-[11px] text-[#6B7FA3] mt-0.5">
                              {vehicle.make} {vehicle.model} ({vehicle.year})
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="text-[#F0F4FF] font-medium">
                          {vehicle.vehicle_type || "—"}
                        </span>
                        <div className="text-[11px] text-[#6B7FA3] mt-0.5 flex items-center gap-1">
                          <GasPump size={11} /> {vehicle.fuel_type.charAt(0).toUpperCase() + vehicle.fuel_type.slice(1)}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        {vehicle.assigned_driver_name ? (
                          <span className="text-[#F0F4FF] font-medium">
                            {vehicle.assigned_driver_name}
                          </span>
                        ) : (
                          <span className="text-[#6B7FA3]">—</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        {vehicle.status === "available" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#10B981] bg-[#10B981]/12 border border-[#10B981]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Active
                          </span>
                        )}
                        {vehicle.status === "assigned" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#3b82f6] bg-[#3b82f6]/12 border border-[#3b82f6]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" /> Assigned
                          </span>
                        )}
                        {vehicle.status === "maintenance" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#f59e0b] bg-[#f59e0b]/12 border border-[#f59e0b]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Maintenance
                          </span>
                        )}
                        {vehicle.status === "inactive" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#6B7FA3] bg-[#6B7FA3]/12 border border-[#6B7FA3]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6B7FA3]" /> Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-[#F0F4FF] font-medium font-mono">
                        {formatOdometer(vehicle.current_odometer)} km
                      </td>

                      <td className="py-4 px-5">
                        {vehicle.last_maintenance_date ? (
                          <span
                            className={
                              isExpired(vehicle.last_maintenance_date)
                                ? "text-[#ef4444]"
                                : "text-[#6B7FA3]"
                            }
                          >
                            {vehicle.last_maintenance_date}
                          </span>
                        ) : (
                          <span className="text-[#6B7FA3]">—</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        {vehicle.next_maintenance_date ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={
                                serviceOverdue
                                  ? "text-[#ef4444] font-medium"
                                  : "text-[#6B7FA3]"
                              }
                            >
                              {vehicle.next_maintenance_date}
                            </span>
                            {serviceOverdue && (
                              <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-[#ef4444]/12 text-[#ef4444] rounded border border-[#ef4444]/20 uppercase tracking-wide">
                                Overdue
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#6B7FA3]">—</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openModal("view", vehicle)}
                            title="View Vehicle Details"
                            className="p-2 rounded bg-white/5 border border-white/5 text-[#F0F4FF] hover:bg-white/10 hover:border-white/10 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openModal("edit", vehicle)}
                            title="Edit Vehicle"
                            className="p-2 rounded bg-white/5 border border-white/5 text-[#F5A623] hover:bg-[#F5A623]/10 hover:border-[#F5A623]/20 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => openModal("delete", vehicle)}
                            title="Delete Vehicle"
                            className="p-2 rounded bg-white/5 border border-white/5 text-[#ef4444] hover:bg-[#ef4444]/10 hover:border-[#ef4444]/20 transition-colors"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {/* ADD & EDIT MODAL */}
        {(activeModal === "add" || activeModal === "edit") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="card-base w-full max-w-2xl bg-[#0D1526] z-10 max-h-[90vh] flex flex-col shadow-2xl relative"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-lg flex items-center gap-2">
                    {activeModal === "add" ? (
                      <>
                        <Plus size={20} className="text-[#F5A623]" /> Add Fleet Vehicle
                      </>
                    ) : (
                      <>
                        <Pencil size={20} className="text-[#F5A623]" /> Edit Vehicle
                      </>
                    )}
                  </h2>
                  <p className="text-[11px] text-[#6B7FA3] mt-0.5">
                    Fill in the vehicle details below.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-full text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(activeModal === "add" ? onAddSubmit : onEditSubmit)}
                className="overflow-y-auto p-6 space-y-6 flex-1"
              >
                {/* Expiry warnings */}
                {watchedInsuranceExpiry && isExpired(watchedInsuranceExpiry) && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-[#ef4444]">
                    <Warning size={18} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Insurance Expired:</strong> The insurance expiry date is in the past.
                    </div>
                  </div>
                )}
                {watchedRegistrationExpiry && isExpired(watchedRegistrationExpiry) && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-[#ef4444]">
                    <Warning size={18} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Registration Expired:</strong> The registration expiry date is in the past.
                    </div>
                  </div>
                )}
                {watchedPucExpiry && isExpired(watchedPucExpiry) && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-[#ef4444]">
                    <Warning size={18} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">PUC Expired:</strong> The PUC expiry date is in the past.
                    </div>
                  </div>
                )}

                {/* Section A: Registration Details */}
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-2 mb-4 flex items-center gap-1.5">
                    <SteeringWheel size={14} /> Vehicle Registration Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Registration Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. MH-01-AB-1234"
                        {...register("registration_number")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.registration_number && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.registration_number.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">VIN</label>
                      <input
                        type="text"
                        placeholder="e.g. 1HGCM82633A004352"
                        {...register("vin")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Make *</label>
                      <input
                        type="text"
                        placeholder="e.g. Toyota"
                        {...register("make")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.make && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.make.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Model *</label>
                      <input
                        type="text"
                        placeholder="e.g. Hiace"
                        {...register("model")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.model && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.model.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Year *</label>
                      <input
                        type="number"
                        placeholder="e.g. 2024"
                        min={2000}
                        max={currentYear + 1}
                        {...register("year")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.year && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.year.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Fuel Type *</label>
                      <select
                        {...register("fuel_type")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors cursor-pointer"
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="cng">CNG</option>
                        <option value="electric">Electric</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.fuel_type && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.fuel_type.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Vehicle Type</label>
                      <select
                        {...register("vehicle_type")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors cursor-pointer"
                      >
                        <option value="">Select type...</option>
                        <option value="Bus">Bus</option>
                        <option value="Minibus">Minibus</option>
                        <option value="Van">Van</option>
                        <option value="Truck">Truck</option>
                        <option value="Car">Car</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Color</label>
                      <input
                        type="text"
                        placeholder="e.g. White"
                        {...register("color")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Seating Capacity</label>
                      <input
                        type="number"
                        placeholder="e.g. 12"
                        min={0}
                        {...register("seating_capacity")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Current Odometer (km) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 15000"
                        min={0}
                        {...register("current_odometer")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.current_odometer && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.current_odometer.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section B: Insurance & Registration */}
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-2 mb-4 flex items-center gap-1.5">
                    <ArrowsClockwise size={14} /> Insurance & Registration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Insurance Number</label>
                      <input
                        type="text"
                        placeholder="e.g. INS-2024-001"
                        {...register("insurance_number")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Insurance Expiry</label>
                      <input
                        type="date"
                        {...register("insurance_expiry")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.insurance_expiry && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.insurance_expiry.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">RC Number</label>
                      <input
                        type="text"
                        placeholder="e.g. RC-2024-001"
                        {...register("rc_number")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">RC / Registration Expiry</label>
                      <input
                        type="date"
                        {...register("registration_expiry")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.registration_expiry && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.registration_expiry.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">PUC Expiry</label>
                      <input
                        type="date"
                        {...register("puc_expiry")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.puc_expiry && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.puc_expiry.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Status *</label>
                      <select
                        {...register("status")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors cursor-pointer"
                      >
                        <option value="available">Active</option>
                        <option value="assigned">Assigned</option>
                        <option value="maintenance">Under Maintenance</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      {errors.status && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.status.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {activeModal === "add" ? "Register Vehicle" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* VIEW DETAILS MODAL */}
        {activeModal === "view" && selectedVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="card-base w-full max-w-xl bg-[#0D1526] z-10 shadow-2xl relative overflow-hidden"
            >
              <div className="bg-[#111E35] p-6 border-b border-white/5 relative">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors bg-[#070D1A]/50 hover:bg-[#070D1A]"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center text-[#F5A623] font-bold text-xl uppercase">
                    {selectedVehicle.make.substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-xl text-[#F0F4FF] tracking-tight">
                      {selectedVehicle.registration_number}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#6B7FA3]">
                        {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                      <span className="text-xs text-[#6B7FA3]">
                        {selectedVehicle.fuel_type.charAt(0).toUpperCase() + selectedVehicle.fuel_type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111E35]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7FA3] block mb-1">Status</span>
                    {selectedVehicle.status === "available" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-[#10B981] bg-[#10B981]/12 border border-[#10B981]/20 rounded">
                        Active
                      </span>
                    )}
                    {selectedVehicle.status === "assigned" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-[#3b82f6] bg-[#3b82f6]/12 border border-[#3b82f6]/20 rounded">
                        Assigned
                      </span>
                    )}
                    {selectedVehicle.status === "maintenance" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/12 border border-[#f59e0b]/20 rounded">
                        Maintenance
                      </span>
                    )}
                    {selectedVehicle.status === "inactive" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-[#6B7FA3] bg-[#6B7FA3]/12 border border-[#6B7FA3]/20 rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="bg-[#111E35]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7FA3] block mb-1">Odometer</span>
                    <span className="text-[#F0F4FF] font-bold text-sm font-mono">
                      {formatOdometer(selectedVehicle.current_odometer)} km
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-1">
                    Vehicle Details
                  </h3>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs md:text-sm">
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Registration Number</span>
                      <strong className="text-[#F0F4FF] font-medium font-mono">{selectedVehicle.registration_number}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">VIN</span>
                      <strong className="text-[#F0F4FF] font-medium font-mono">{selectedVehicle.vin || "N/A"}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Make & Model</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedVehicle.make} {selectedVehicle.model}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Year</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedVehicle.year}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Vehicle Type</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedVehicle.vehicle_type || "N/A"}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Color</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedVehicle.color || "N/A"}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Fuel Type</span>
                      <strong className="text-[#F0F4FF] font-medium capitalize">{selectedVehicle.fuel_type}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Seating Capacity</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedVehicle.seating_capacity || "N/A"}</strong>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Assigned Driver</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedVehicle.assigned_driver_name || "Not assigned"}</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-1">
                    Insurance & Registration
                  </h3>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs md:text-sm">
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Insurance Number</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedVehicle.insurance_number || "N/A"}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Insurance Expiry</span>
                      <strong className={`font-medium ${isExpired(selectedVehicle.insurance_expiry) ? "text-[#ef4444]" : "text-[#F0F4FF]"}`}>
                        {selectedVehicle.insurance_expiry || "N/A"}
                        {isExpired(selectedVehicle.insurance_expiry) && " (Expired)"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">RC Number</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedVehicle.rc_number || "N/A"}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">RC / Registration Expiry</span>
                      <strong className={`font-medium ${isExpired(selectedVehicle.registration_expiry) ? "text-[#ef4444]" : "text-[#F0F4FF]"}`}>
                        {selectedVehicle.registration_expiry || "N/A"}
                        {isExpired(selectedVehicle.registration_expiry) && " (Expired)"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">PUC Expiry</span>
                      <strong className={`font-medium ${isExpired(selectedVehicle.puc_expiry) ? "text-[#ef4444]" : "text-[#F0F4FF]"}`}>
                        {selectedVehicle.puc_expiry || "N/A"}
                        {isExpired(selectedVehicle.puc_expiry) && " (Expired)"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-1">
                    Service Schedule
                  </h3>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs md:text-sm">
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Last Service</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedVehicle.last_maintenance_date || "N/A"}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Next Service</span>
                      <strong className={`font-medium ${isExpired(selectedVehicle.next_maintenance_date) ? "text-[#ef4444]" : "text-[#F0F4FF]"}`}>
                        {selectedVehicle.next_maintenance_date || "N/A"}
                        {isExpired(selectedVehicle.next_maintenance_date) && " (Overdue)"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111E35]/20 p-3.5 rounded-lg border border-white/5 text-[10px] text-[#6B7FA3] flex justify-between">
                  <span>Created: {new Date(selectedVehicle.created_at).toLocaleString()}</span>
                  <span>Updated: {new Date(selectedVehicle.updated_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-[#111E35]/40 border-t border-white/5 flex justify-end gap-2.5">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setTimeout(() => openModal("edit", selectedVehicle), 200);
                  }}
                  className="btn-ghost"
                >
                  <Pencil size={14} /> Edit Vehicle
                </button>
                <button onClick={() => setActiveModal(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {activeModal === "delete" && selectedVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="card-base w-full max-w-md bg-[#0D1526] z-10 shadow-2xl relative p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center mx-auto mb-4 text-[#ef4444]">
                <Warning size={24} weight="bold" />
              </div>

              <h3 className="font-extrabold text-lg text-[#F0F4FF]">Delete Vehicle?</h3>
              <p className="text-xs text-[#6B7FA3] mt-2 mb-6">
                Are you sure you want to delete{" "}
                <strong className="text-[#F0F4FF]">{selectedVehicle.registration_number}</strong>?{" "}
                This action will permanently remove this vehicle and all associated records.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setActiveModal(null)}
                  className="btn-ghost flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-[#ef4444] hover:bg-[#dc2626] text-white py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold transition-colors flex-1"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-3.5 rounded-lg border flex items-start gap-3 shadow-lg ${
                toast.type === "success"
                  ? "bg-[#0D1526] border-[#10B981]/20 text-[#10B981]"
                  : toast.type === "error"
                    ? "bg-[#0D1526] border-[#ef4444]/20 text-[#ef4444]"
                    : "bg-[#0D1526] border-[#f59e0b]/20 text-[#f59e0b]"
              }`}
            >
              {toast.type === "success" && <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />}
              {toast.type === "error" && <XCircle size={20} className="flex-shrink-0 mt-0.5" />}
              {toast.type === "warning" && <Warning size={20} className="flex-shrink-0 mt-0.5" />}

              <div className="flex-1">
                <div className="text-xs text-[#F0F4FF] font-medium leading-relaxed">{toast.message}</div>
              </div>

              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
