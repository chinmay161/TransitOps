"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
  Info,
  Spinner,
  Calendar,
  IdentificationCard,
  Phone,
  Envelope,
  User,
  Wrench,
  CurrencyDollar,
  X,
  ShieldCheck,
  NavigationArrow,
  MapPin,
  Clock,
  RoadHorizon,
  FileText
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { DemoSwitcher } from "../../components/DemoSwitcher";
import { DigiLockerVerificationBlocker } from "../../components/DigiLockerVerificationBlocker";

const API_URL = "http://localhost:5000";

interface Trip {
  id: string;
  driver_id: string;
  vehicle_id: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  origin: string;
  destination: string;
  estimated_distance_km: number | null;
  estimated_duration_minutes: number | null;
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  driver_name: string;
  driver_license: string;
  driver_status: string;
  driver_license_expiry: string;
  driver_verified: boolean;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_registration_number: string;
  vehicle_status: string;
}

interface Driver {
  id: string;
  full_name: string;
  license_number: string;
  license_expiry: string;
  status: string;
  verification_status?: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  registration_number: string;
  status: string;
}

interface Toast {
  type: "success" | "error" | "warning";
  message: string;
  id: number;
}

export default function TripManagementPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");

  // Modals state
  const [activeModal, setActiveModal] = useState<"add" | "edit" | "view" | "delete" | "complete" | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Toasts state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // React Hook Form
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      driver_id: "",
      vehicle_id: "",
      origin: "",
      destination: "",
      estimated_distance_km: "",
      estimated_duration_minutes: "",
      scheduled_start: "",
      scheduled_end: "",
      notes: "",
      final_odometer: ""
    }
  });

  // Load all required data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tRes, dRes, vRes] = await Promise.all([
        fetch(`${API_URL}/trips`),
        fetch(`${API_URL}/drivers`),
        fetch(`${API_URL}/vehicles`)
      ]);

      if (!tRes.ok) throw new Error("Failed to load trips.");
      if (!dRes.ok) throw new Error("Failed to load drivers.");
      if (!vRes.ok) throw new Error("Failed to load vehicles.");

      const tData = await tRes.json();
      const dData = await dRes.json();
      const vData = await vRes.json();

      setTrips(tData);
      setDrivers(dData);
      setVehicles(vData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading dashboard.");
      showToast("error", err.message || "Could not connect to the API server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type: "success" | "error" | "warning", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { type, message, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Determine eligible drivers
  const getEligibleDrivers = (editingTripId?: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return drivers.filter((d) => {
      // 1. Driving License Verified via service
      const isVerified = d.verification_status === "verified";
      if (!isVerified) return false;

      // 2. License not expired
      const expiry = new Date(d.license_expiry);
      if (expiry < today) return false;

      // 3. Driver status must be available (or currently assigned to the editing trip)
      const isCurrentlyAssigned = editingTripId && trips.find(t => t.id === editingTripId)?.driver_id === d.id;
      if (d.status !== "available" && !isCurrentlyAssigned) return false;

      // 4. Driver must not have other active trips
      const hasActiveTrips = trips.some(
        (t) => t.driver_id === d.id && t.id !== editingTripId && (t.status === "scheduled" || t.status === "in_progress")
      );
      if (hasActiveTrips) return false;

      return true;
    });
  };

  // Determine eligible vehicles
  const getEligibleVehicles = (editingTripId?: string) => {
    return vehicles.filter((v) => {
      // 1. Vehicle status must be available (or assigned to the editing trip)
      const isCurrentlyAssigned = editingTripId && trips.find(t => t.id === editingTripId)?.vehicle_id === v.id;
      if (v.status !== "available" && !isCurrentlyAssigned) return false;

      // 2. Not in maintenance or inactive
      if (v.status === "maintenance" || v.status === "inactive") return false;

      // 3. No other active trips
      const hasActiveTrips = trips.some(
        (t) => t.vehicle_id === v.id && t.id !== editingTripId && (t.status === "scheduled" || t.status === "in_progress")
      );
      if (hasActiveTrips) return false;

      return true;
    });
  };

  // Filter trip list
  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vehicle_registration_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesDriver = driverFilter === "all" || t.driver_id === driverFilter;
    const matchesVehicle = vehicleFilter === "all" || t.vehicle_id === vehicleFilter;

    return matchesSearch && matchesStatus && matchesDriver && matchesVehicle;
  });

  // Calculate statistics
  const activeCount = trips.filter((t) => t.status === "in_progress").length;
  const pendingCount = trips.filter((t) => t.status === "scheduled").length;
  const completedCount = trips.filter((t) => t.status === "completed").length;
  const activeVehiclesCount = vehicles.filter((v) => v.status !== "inactive").length;
  const onTripVehiclesCount = vehicles.filter((v) => v.status === "assigned").length;
  const fleetUtilization = activeVehiclesCount > 0 ? (onTripVehiclesCount / activeVehiclesCount) * 100 : 0;

  // Form submit: Create Trip
  const onAddSubmit = async (formData: any) => {
    try {
      const response = await fetch(`${API_URL}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimated_distance_km: formData.estimated_distance_km ? Number(formData.estimated_distance_km) : null,
          estimated_duration_minutes: formData.estimated_duration_minutes ? Number(formData.estimated_duration_minutes) : null
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to create trip.");
      }

      showToast("success", `Trip to ${resData.destination} created and scheduled.`);
      setActiveModal(null);
      reset();
      loadData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Form submit: Edit Trip
  const onEditSubmit = async (formData: any) => {
    if (!selectedTrip) return;
    try {
      const response = await fetch(`${API_URL}/trips/${selectedTrip.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimated_distance_km: formData.estimated_distance_km ? Number(formData.estimated_distance_km) : null,
          estimated_duration_minutes: formData.estimated_duration_minutes ? Number(formData.estimated_duration_minutes) : null
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to update trip.");
      }

      showToast("success", "Trip route and assignment updated.");
      setActiveModal(null);
      setSelectedTrip(null);
      reset();
      loadData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Dispatch Start Trip
  const handleStartTrip = async (tripId: string) => {
    try {
      const res = await fetch(`${API_URL}/trips/${tripId}/start`, {
        method: "PATCH"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start trip.");

      showToast("success", "Trip successfully dispatched. Vehicle & Driver statuses updated.");
      loadData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Complete Trip Form Submit
  const handleCompleteSubmit = async (formData: any) => {
    if (!selectedTrip) return;
    try {
      const res = await fetch(`${API_URL}/trips/${selectedTrip.id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          final_odometer: formData.final_odometer ? Number(formData.final_odometer) : null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete trip.");

      showToast("success", "Trip completed. Driver & Vehicle released.");
      setActiveModal(null);
      setSelectedTrip(null);
      reset();
      loadData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Cancel Trip
  const handleCancelTrip = async (tripId: string) => {
    try {
      const res = await fetch(`${API_URL}/trips/${tripId}/cancel`, {
        method: "PATCH"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel trip.");

      showToast("warning", "Trip cancelled. Driver & Vehicle released to Available status.");
      loadData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Delete Trip Record
  const handleDeleteTrip = async () => {
    if (!selectedTrip) return;
    try {
      const res = await fetch(`${API_URL}/trips/${selectedTrip.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete trip.");

      showToast("success", "Trip record deleted successfully.");
      setActiveModal(null);
      setSelectedTrip(null);
      loadData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Open modals helper
  const openModal = (type: "add" | "edit" | "view" | "delete" | "complete", trip?: Trip) => {
    setSelectedTrip(trip || null);
    setActiveModal(type);

    if (type === "edit" && trip) {
      setValue("driver_id", trip.driver_id);
      setValue("vehicle_id", trip.vehicle_id);
      setValue("origin", trip.origin);
      setValue("destination", trip.destination);
      setValue("estimated_distance_km", trip.estimated_distance_km ? trip.estimated_distance_km.toString() : "");
      setValue("estimated_duration_minutes", trip.estimated_duration_minutes ? trip.estimated_duration_minutes.toString() : "");
      
      // Format timestamps to local datetime-local value (YYYY-MM-DDTHH:MM)
      const startLocal = new Date(trip.scheduled_start).toISOString().slice(0, 16);
      const endLocal = new Date(trip.scheduled_end).toISOString().slice(0, 16);
      setValue("scheduled_start", startLocal);
      setValue("scheduled_end", endLocal);
      setValue("notes", trip.notes || "");
    } else if (type === "complete" && trip) {
      setValue("final_odometer", "");
    } else if (type === "add") {
      reset({
        driver_id: "",
        vehicle_id: "",
        origin: "",
        destination: "",
        estimated_distance_km: "",
        estimated_duration_minutes: "",
        scheduled_start: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // 1 hour ahead
        scheduled_end: new Date(Date.now() + 18000000).toISOString().slice(0, 16), // 5 hours ahead
        notes: "",
        final_odometer: ""
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1A] text-[#F0F4FF] dot-grid relative pb-16">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#070D1A]/90 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <a href="/" className="flex items-center gap-2 group text-decoration-none">
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
        </a>
        <div className="flex items-center gap-4">
          <DemoSwitcher />
          <a href="/" className="flex items-center gap-1.5 text-xs text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors font-medium">
            <CaretLeft size={14} /> Back to Landing Page
          </a>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        
        {/* Module Sub-Navbar Navigation */}
        <div className="flex border-b border-white/5 mb-8 gap-6 text-xs md:text-sm font-semibold">
          <a
            href="/drivers"
            className="pb-3 border-b-2 border-transparent text-[#6B7FA3] flex items-center gap-2 hover:text-[#F0F4FF] hover:border-white/10 transition-colors"
          >
            <User size={16} /> Drivers
          </a>
          <a
            href="/maintenance"
            className="pb-3 border-b-2 border-transparent text-[#6B7FA3] flex items-center gap-2 hover:text-[#F0F4FF] hover:border-white/10 transition-colors"
          >
            <Calendar size={16} /> Maintenance
          </a>
          <a
            href="/trips"
            className="pb-3 border-b-2 border-[#F5A623] text-[#F5A623] flex items-center gap-2 transition-colors"
          >
            <ShieldCheck size={16} /> Trips
          </a>
        </div>

        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F0F4FF] tracking-tight flex items-center gap-2.5">
              <NavigationArrow size={28} className="text-[#F5A623]" /> Trip Dispatch Management
            </h1>
            <p className="text-xs md:text-sm text-[#6B7FA3] mt-1">
              Assign eligible verified drivers and vehicles, schedule routes, and coordinate dispatch dispatches.
            </p>
          </div>
          <button
            onClick={() => openModal("add")}
            className="btn-primary"
          >
            <Plus size={18} weight="bold" /> Create Schedule Trip
          </button>
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          
          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7FA3]">Total Trips</span>
            <div className="text-xl md:text-2xl font-black text-[#F0F4FF] mt-1">{loading ? "..." : trips.length}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#3b82f6]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3b82f6]">Active Trips</span>
            <div className="text-xl md:text-2xl font-black text-[#3b82f6] mt-1">{loading ? "..." : activeCount}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#f59e0b]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#f59e0b]">Pending / Sched</span>
            <div className="text-xl md:text-2xl font-black text-[#f59e0b] mt-1">{loading ? "..." : pendingCount}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#10B981]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#10B981]">Completed</span>
            <div className="text-xl md:text-2xl font-black text-[#10B981] mt-1">{loading ? "..." : completedCount}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#a855f7] col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#a855f7]">Fleet Utilization</span>
            <div className="text-xl md:text-2xl font-black text-[#a855f7] mt-1">
              {loading ? "..." : `${fleetUtilization.toFixed(1)}%`}
            </div>
          </div>
          
        </div>

        {/* Search & Filters */}
        <div className="card-base bg-[#0D1526] p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:max-w-md">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]" size={18} />
            <input
              type="text"
              placeholder="Search by route, driver, registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-xs md:text-sm text-[#F0F4FF] placeholder-[#6B7FA3] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7FA3]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#070D1A] border border-white/5 rounded-lg py-1.5 px-2.5 text-xs text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
              >
                <option value="all">All Trips</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Driver Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7FA3]">Driver:</span>
              <select
                value={driverFilter}
                onChange={(e) => setDriverFilter(e.target.value)}
                className="bg-[#070D1A] border border-white/5 rounded-lg py-1.5 px-2.5 text-xs text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] max-w-[150px]"
              >
                <option value="all">All Drivers</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.full_name}</option>
                ))}
              </select>
            </div>

            {/* Vehicle Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7FA3]">Vehicle:</span>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="bg-[#070D1A] border border-white/5 rounded-lg py-1.5 px-2.5 text-xs text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] max-w-[150px]"
              >
                <option value="all">All Vehicles</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.registration_number}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Trips Table */}
        {error ? (
          <div className="card-base bg-[#0D1526] border-red-500/20 p-8 text-center">
            <Warning size={42} className="text-[#ef4444] mx-auto mb-3" />
            <h3 className="font-bold text-[#F0F4FF]">Server Connection Failure</h3>
            <p className="text-xs text-[#6B7FA3] mt-1 mb-4">Could not load trips from the server.</p>
            <button onClick={loadData} className="btn-ghost text-xs">Retry Connection</button>
          </div>
        ) : loading ? (
          <div className="card-base bg-[#0D1526] p-1 divide-y divide-white/5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                <div className="h-3 w-44 bg-white/5 rounded" />
                <div className="h-3 w-28 bg-white/5 rounded" />
                <div className="h-3 w-20 bg-white/5 rounded" />
                <div className="h-8 w-44 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="card-base bg-[#0D1526] p-12 text-center">
            <NavigationArrow size={48} className="text-[#3A4F73] mx-auto mb-3 animate-pulse" />
            <h3 className="font-bold text-[#F0F4FF]">No Trips Found</h3>
            <p className="text-xs text-[#6B7FA3] max-w-sm mx-auto mt-1">
              Create a new schedule route and assign vehicles/verified drivers to dispatch.
            </p>
          </div>
        ) : (
          <div className="card-base bg-[#0D1526] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold text-[#6B7FA3] uppercase tracking-wider bg-white/[0.01]">
                  <th className="py-4 px-5">Route (Origin → Destination)</th>
                  <th className="py-4 px-5">Assigned Driver</th>
                  <th className="py-4 px-5">Assigned Vehicle</th>
                  <th className="py-4 px-5">Scheduled Start</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs md:text-sm">
                {filteredTrips.map((t) => {
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.01] transition-colors group">
                      
                      {/* Route */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#F0F4FF] flex items-center gap-1.5">
                          <span>{t.origin}</span>
                          <span className="text-[#6B7FA3]">→</span>
                          <span>{t.destination}</span>
                        </div>
                        {t.estimated_distance_km && (
                          <div className="text-[10px] text-[#6B7FA3] mt-0.5 font-mono">
                            {t.estimated_distance_km} km • Est: {t.estimated_duration_minutes || "—"} mins
                          </div>
                        )}
                      </td>

                      {/* Driver */}
                      <td className="py-4 px-5">
                        <div className="font-medium text-[#F0F4FF]">{t.driver_name}</div>
                        <div className="text-[10px] text-[#6B7FA3] font-mono mt-0.5 flex items-center gap-1">
                          <span>{t.driver_license}</span>
                          {t.driver_verified ? (
                            <span className="text-[#10B981] font-bold text-[9px] uppercase bg-[#10B981]/10 px-1 rounded">Verified</span>
                          ) : (
                            <span className="text-[#f59e0b] font-bold text-[9px] uppercase bg-[#f59e0b]/10 px-1 rounded">Pending</span>
                          )}
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-4 px-5">
                        <div className="font-medium text-[#F0F4FF]">
                          {t.vehicle_make} {t.vehicle_model}
                        </div>
                        <div className="text-[10px] font-mono text-[#6B7FA3] mt-0.5">
                          {t.vehicle_registration_number}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5 text-[#F0F4FF] font-medium">
                        {new Date(t.scheduled_start).toLocaleString()}
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-5">
                        {t.status === "scheduled" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#f59e0b] bg-[#f59e0b]/12 border border-[#f59e0b]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Scheduled
                          </span>
                        )}
                        {t.status === "in_progress" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#3b82f6] bg-[#3b82f6]/12 border border-[#3b82f6]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" /> Dispatched
                          </span>
                        )}
                        {t.status === "completed" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#10B981] bg-[#10B981]/12 border border-[#10B981]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Completed
                          </span>
                        )}
                        {t.status === "cancelled" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#ef4444] bg-[#ef4444]/12 border border-[#ef4444]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> Cancelled
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openModal("view", t)}
                            title="View Trip Details"
                            className="p-2 rounded bg-white/5 border border-white/5 text-[#F0F4FF] hover:bg-white/10 hover:border-white/10 transition-colors"
                          >
                            <Eye size={14} />
                          </button>

                          {t.status === "scheduled" && (
                            <>
                              <button
                                onClick={() => handleStartTrip(t.id)}
                                title="Dispatch / Start Trip"
                                className="px-2.5 py-1.5 rounded bg-white/5 border border-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/10 transition-colors text-xs font-bold"
                              >
                                Dispatch
                              </button>
                              <button
                                onClick={() => openModal("edit", t)}
                                title="Edit Trip"
                                className="p-2 rounded bg-white/5 border border-white/5 text-[#F5A623] hover:bg-[#F5A623]/10 hover:border-[#F5A623]/20 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                            </>
                          )}

                          {t.status === "in_progress" && (
                            <button
                              onClick={() => openModal("complete", t)}
                              title="Complete Trip"
                              className="px-2.5 py-1.5 rounded bg-[#10B981] text-white hover:bg-[#059669] transition-colors text-xs font-bold"
                            >
                              Complete
                            </button>
                          )}

                          {(t.status === "scheduled" || t.status === "in_progress") && (
                            <button
                              onClick={() => {
                                if(confirm("Are you sure you want to cancel this trip? Both driver and vehicle will be set back to available.")) {
                                  handleCancelTrip(t.id);
                                }
                              }}
                              title="Cancel Trip"
                              className="p-2 rounded bg-white/5 border border-white/5 text-[#ef4444] hover:bg-[#ef4444]/10 hover:border-[#ef4444]/20 transition-colors text-xs font-bold"
                            >
                              Cancel
                            </button>
                          )}

                          {t.status !== "in_progress" && (
                            <button
                              onClick={() => openModal("delete", t)}
                              title="Delete Record"
                              className="p-2 rounded bg-white/5 border border-white/5 text-[#ef4444] hover:bg-[#ef4444]/10 hover:border-[#ef4444]/20 transition-colors"
                            >
                              <Trash size={14} />
                            </button>
                          )}
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

      {/* MODALS OVERLAY */}
      <AnimatePresence>
        
        {/* ADD & EDIT SCHEDULE MODAL */}
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
              className="card-base w-full max-w-xl bg-[#0D1526] z-10 max-h-[90vh] flex flex-col shadow-2xl relative"
            >
              
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-lg flex items-center gap-2">
                    {activeModal === "add" ? (
                      <>
                        <Plus size={20} className="text-[#F5A623]" /> Create Scheduled Trip
                      </>
                    ) : (
                      <>
                        <Pencil size={20} className="text-[#F5A623]" /> Edit Trip Schedule
                      </>
                    )}
                  </h2>
                  <p className="text-[11px] text-[#6B7FA3] mt-0.5">
                    Select verified drivers, active vehicles, and input route schedules.
                  </p>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-full text-[#6B7FA3] hover:text-[#F0F4FF]">
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(activeModal === "add" ? onAddSubmit : onEditSubmit)}
                className="overflow-y-auto p-6 space-y-5 flex-1 text-xs md:text-sm"
              >
                
                {/* Driver select dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Driver (Only Verified & Available) *</label>
                  <select
                    {...register("driver_id", { required: "Driver assignment is required." })}
                    className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
                  >
                    <option value="">Select an eligible verified driver...</option>
                    {getEligibleDrivers(selectedTrip?.id).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} ({d.license_number}) [License Expiry: {d.license_expiry}]
                      </option>
                    ))}
                  </select>
                  {errors.driver_id && <p className="text-[10px] text-[#ef4444] mt-1">{errors.driver_id.message}</p>}
                </div>

                {/* Vehicle select dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Vehicle (Only Active & Available) *</label>
                  <select
                    {...register("vehicle_id", { required: "Vehicle assignment is required." })}
                    className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
                  >
                    <option value="">Select an eligible available vehicle...</option>
                    {getEligibleVehicles(selectedTrip?.id).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.registration_number}) [Status: {v.status}]
                      </option>
                    ))}
                  </select>
                  {errors.vehicle_id && <p className="text-[10px] text-[#ef4444] mt-1">{errors.vehicle_id.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Origin */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Origin / Departure *</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune Hub"
                      {...register("origin", { required: "Origin is required" })}
                      className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none"
                    />
                    {errors.origin && <p className="text-[10px] text-[#ef4444] mt-1">{errors.origin.message}</p>}
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Destination / Arrival *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai Port"
                      {...register("destination", { required: "Destination is required" })}
                      className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none"
                    />
                    {errors.destination && <p className="text-[10px] text-[#ef4444] mt-1">{errors.destination.message}</p>}
                  </div>

                  {/* Distance */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Est Distance (km)</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      {...register("estimated_distance_km", { min: { value: 0, message: "Cannot be negative" } })}
                      className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none"
                    />
                    {errors.estimated_distance_km && <p className="text-[10px] text-[#ef4444] mt-1">{errors.estimated_distance_km.message}</p>}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Est Duration (mins)</label>
                    <input
                      type="number"
                      placeholder="e.g. 180"
                      {...register("estimated_duration_minutes", { min: { value: 0, message: "Cannot be negative" } })}
                      className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none"
                    />
                    {errors.estimated_duration_minutes && <p className="text-[10px] text-[#ef4444] mt-1">{errors.estimated_duration_minutes.message}</p>}
                  </div>

                  {/* Sched start */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Scheduled Start *</label>
                    <input
                      type="datetime-local"
                      {...register("scheduled_start", { required: "Start time is required" })}
                      className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none"
                    />
                  </div>

                  {/* Sched End */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Scheduled End *</label>
                    <input
                      type="datetime-local"
                      {...register("scheduled_end", { required: "End time is required" })}
                      className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Dispatch Instructions / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Route instructions, customer contact detail notes..."
                    {...register("notes")}
                    className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                  <button type="button" onClick={() => setActiveModal(null)} className="btn-ghost">Cancel</button>
                  <button type="submit" className="btn-primary">
                    {activeModal === "add" ? "Create Trip" : "Save Schedule"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}

        {/* TRIP COMPLETE ODOMETER MODAL */}
        {activeModal === "complete" && selectedTrip && (
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
              className="card-base w-full max-w-md bg-[#0D1526] z-10 p-6 shadow-2xl relative space-y-4"
            >
              <div className="border-b border-white/5 pb-3">
                <h3 className="font-extrabold text-base text-[#F0F4FF]">Complete Active Trip</h3>
                <p className="text-[10px] text-[#6B7FA3] mt-0.5">Route: {selectedTrip.origin} → {selectedTrip.destination}</p>
              </div>

              <form onSubmit={handleSubmit(handleCompleteSubmit)} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Final Vehicle Odometer (km)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10450.50"
                    {...register("final_odometer", {
                      validate: (v) => !v || Number(v) >= 0 || "Cannot be negative"
                    })}
                    className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none"
                  />
                  {errors.final_odometer && <p className="text-[10px] text-[#ef4444] mt-1">{errors.final_odometer.message}</p>}
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                  <button type="button" onClick={() => setActiveModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">Complete Trip</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* TRIP DETAIL VIEW MODAL */}
        {activeModal === "view" && selectedTrip && (
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
              className="card-base w-full max-w-2xl bg-[#0D1526] z-10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Header */}
              <div className="bg-[#111E35] p-5 border-b border-white/5 relative">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B7FA3] hover:text-[#F0F4FF] bg-[#070D1A]/50 hover:bg-[#070D1A]"
                >
                  <X size={16} />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center text-[#F5A623]">
                    <NavigationArrow size={24} />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base md:text-lg text-[#F0F4FF]">
                      {selectedTrip.origin} → {selectedTrip.destination}
                    </h2>
                    <p className="text-xs text-[#6B7FA3] mt-0.5">
                      Trip ID: {selectedTrip.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* View Scroll Body */}
              <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs md:text-sm">
                
                {/* Timeline Status */}
                <div className="space-y-3">
                  <span className="text-[#6B7FA3] block text-[10px] uppercase font-bold tracking-wider">Trip Timeline Status</span>
                  
                  <div className="relative flex items-center justify-between max-w-md mx-auto py-2">
                    <div className="absolute left-0 right-0 h-0.5 bg-white/10 -z-10" />
                    
                    <div className="flex flex-col items-center gap-1 bg-[#0D1526] px-2">
                      <div className="w-6 h-6 rounded-full bg-[#f59e0b] border-4 border-[#0D1526] flex items-center justify-center text-[10px] text-white font-bold">1</div>
                      <span className="text-[10px] font-bold text-[#f59e0b]">Scheduled</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 bg-[#0D1526] px-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-4 border-[#0D1526] ${
                        selectedTrip.status === "in_progress" || selectedTrip.status === "completed" ? "bg-[#3b82f6] text-white" : "bg-[#1C2C4E] text-[#6B7FA3]"
                      }`}>2</div>
                      <span className={`text-[10px] font-bold ${
                        selectedTrip.status === "in_progress" || selectedTrip.status === "completed" ? "text-[#3b82f6]" : "text-[#6B7FA3]"
                      }`}>Dispatched</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 bg-[#0D1526] px-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-4 border-[#0D1526] ${
                        selectedTrip.status === "completed" ? "bg-[#10B981] text-white" : selectedTrip.status === "cancelled" ? "bg-[#ef4444] text-white" : "bg-[#1C2C4E] text-[#6B7FA3]"
                      }`}>3</div>
                      <span className={`text-[10px] font-bold ${
                        selectedTrip.status === "completed" ? "text-[#10B981]" : selectedTrip.status === "cancelled" ? "text-[#ef4444]" : "text-[#6B7FA3]"
                      }`}>{selectedTrip.status === "cancelled" ? "Cancelled" : "Completed"}</span>
                    </div>

                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#111E35]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7FA3] block mb-1">Estimated Distance</span>
                    <strong className="text-[#F0F4FF]">{selectedTrip.estimated_distance_km ? `${selectedTrip.estimated_distance_km} km` : "—"}</strong>
                  </div>

                  <div className="bg-[#111E35]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7FA3] block mb-1">Estimated Duration</span>
                    <strong className="text-[#F0F4FF]">{selectedTrip.estimated_duration_minutes ? `${selectedTrip.estimated_duration_minutes} mins` : "—"}</strong>
                  </div>

                  <div className="bg-[#111E35]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7FA3] block mb-1">Scheduled Departure</span>
                    <strong className="text-[#F0F4FF] font-mono text-[11px]">{new Date(selectedTrip.scheduled_start).toLocaleDateString()}</strong>
                  </div>
                </div>

                {/* Driver credentials */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-1">Driver Assignment Details</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px]">Full Name</span>
                      <strong className="text-[#F0F4FF]">{selectedTrip.driver_name}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px]">License Number</span>
                      <strong className="text-[#F0F4FF] font-mono">{selectedTrip.driver_license}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px]">Verification Source</span>
                      {selectedTrip.driver_verified ? (
                        <span className="text-[#10B981] font-bold uppercase text-[9px] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">DigiLocker Verified</span>
                      ) : (
                        <span className="text-[#f59e0b] font-bold uppercase text-[9px] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded border border-[#f59e0b]/20">Pending Verification</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px]">License Status</span>
                      <strong className="text-[#F0F4FF] font-mono">{selectedTrip.driver_license_expiry}</strong>
                    </div>
                  </div>
                </div>

                {/* Vehicle details */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-1">Vehicle Assignment Details</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px]">Model Make</span>
                      <strong className="text-[#F0F4FF]">{selectedTrip.vehicle_make} {selectedTrip.vehicle_model}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px]">Registration Plate</span>
                      <strong className="text-[#F0F4FF] font-mono">{selectedTrip.vehicle_registration_number}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px]">Vehicle Status</span>
                      <strong className="text-[#F0F4FF] uppercase text-[11px]">{selectedTrip.vehicle_status}</strong>
                    </div>
                  </div>
                </div>

                {/* Schedule timeline */}
                <div className="space-y-3 bg-[#111E35]/10 p-3.5 rounded-lg border border-white/5">
                  <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#6B7FA3]">Dispatch / Operational Dates</h4>
                  <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                    <div>
                      <span className="text-[#6B7FA3] block">Actual Departure:</span>
                      <strong className="text-[#F0F4FF]">{selectedTrip.actual_start ? new Date(selectedTrip.actual_start).toLocaleString() : "— (Not started)"}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B7FA3] block">Actual Arrival:</span>
                      <strong className="text-[#F0F4FF]">{selectedTrip.actual_end ? new Date(selectedTrip.actual_end).toLocaleString() : "— (Not completed)"}</strong>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedTrip.notes && (
                  <div>
                    <span className="text-[#6B7FA3] block text-[10px] uppercase font-bold tracking-wider mb-1">Dispatch Notes</span>
                    <div className="bg-[#070D1A] border border-white/5 p-3 rounded-lg leading-relaxed text-[#F0F4FF]">
                      {selectedTrip.notes}
                    </div>
                  </div>
                )}

              </div>

              {/* View Footer */}
              <div className="p-4 bg-[#111E35]/40 border-t border-white/5 flex justify-end">
                <button onClick={() => setActiveModal(null)} className="btn-primary">
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* DELETE TRIP CONFIRMATION MODAL */}
        {activeModal === "delete" && selectedTrip && (
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
              className="card-base w-full max-w-md bg-[#0D1526] z-10 shadow-2xl relative p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center mx-auto mb-4 text-[#ef4444]">
                <Trash size={24} />
              </div>
              
              <h3 className="font-extrabold text-lg text-[#F0F4FF]">Delete Trip Record?</h3>
              <p className="text-xs text-[#6B7FA3] mt-2 mb-6">
                Are you sure you want to delete the scheduled trip from <strong className="text-[#F0F4FF]">{selectedTrip.origin}</strong> to <strong className="text-[#F0F4FF]">{selectedTrip.destination}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-center">
                <button onClick={() => setActiveModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
                <button
                  onClick={handleDeleteTrip}
                  className="bg-[#ef4444] hover:bg-[#dc2626] text-white py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold transition-colors flex-1"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      {/* TOAST SYSTEM */}
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
                <div className="text-xs text-[#F0F4FF] font-medium leading-relaxed">
                  {toast.message}
                </div>
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

      <DigiLockerVerificationBlocker />

    </div>
  );
}
