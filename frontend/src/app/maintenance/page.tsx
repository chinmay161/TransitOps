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
  ShieldCheck
} from "@phosphor-icons/react";
import { DemoSwitcher } from "../../components/DemoSwitcher";
import { DigiLockerVerificationBlocker } from "../../components/DigiLockerVerificationBlocker";

// API base URL
const API_URL = "http://localhost:5000";

// Interface for Vehicle
interface Vehicle {
  id: string;
  registration_number: string;
  vin: string | null;
  make: string;
  model: string;
  year: number;
  fuel_type: string;
  seating_capacity: number;
  status: "available" | "assigned" | "maintenance" | "inactive";
  current_odometer: number;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
}

// Interface for Maintenance Record
interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  type: string;
  description: string | null;
  status: "scheduled" | "in_progress" | "completed";
  scheduled_date: string; // YYYY-MM-DD
  completed_date: string | null; // YYYY-MM-DD
  cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  make: string;
  model: string;
  registration_number: string;
  vehicle_status: string;
}

// Toast notification interface
interface Toast {
  type: "success" | "error" | "warning";
  message: string;
  id: number;
}

export default function MaintenanceManagementPage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectableVehicles, setSelectableVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");

  // Modals state
  const [activeModal, setActiveModal] = useState<"add" | "edit" | "view" | "delete" | "complete" | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  // Toasts state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Form handling for Add/Edit
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      vehicle_id: "",
      type: "Oil Change",
      description: "",
      status: "scheduled",
      scheduled_date: new Date().toISOString().split("T")[0],
      completed_date: "",
      cost: "",
      notes: ""
    }
  });

  // Watch status to show completion fields dynamically in Edit modal
  const watchedStatus = watch("status");

  // Fetch all maintenance records and vehicles
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Load maintenance records
      const mRes = await fetch(`${API_URL}/maintenance`);
      if (!mRes.ok) throw new Error("Failed to load maintenance records.");
      const mData = await mRes.json();
      setRecords(mData);

      // 2. Load all vehicles (for statistics and vehicle listing)
      const vRes = await fetch(`${API_URL}/vehicles`);
      if (!vRes.ok) throw new Error("Failed to load vehicles.");
      const vData = await vRes.json();
      setVehicles(vData);

      // 3. Load selectable vehicles (for schedule dropdown)
      const selectRes = await fetch(`${API_URL}/vehicles?selectable=true`);
      if (!selectRes.ok) throw new Error("Failed to load selectable vehicles.");
      const selectData = await selectRes.json();
      setSelectableVehicles(selectData);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while connecting to the backend.");
      showToast("error", err.message || "Could not retrieve data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show toasts helper
  const showToast = (type: "success" | "error" | "warning", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { type, message, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Filter maintenance records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesVehicle = vehicleFilter === "all" || r.vehicle_id === vehicleFilter;

    return matchesSearch && matchesStatus && matchesVehicle;
  });

  // Calculate statistics
  const totalCount = records.length;
  const scheduledCount = records.filter((r) => r.status === "scheduled").length;
  const inProgressCount = records.filter((r) => r.status === "in_progress").length;
  const completedCount = records.filter((r) => r.status === "completed").length;
  const totalCost = records
    .filter((r) => r.status === "completed" && r.cost)
    .reduce((sum, r) => sum + Number(r.cost), 0);

  // Form submit: Schedule Maintenance
  const onAddSubmit = async (formData: any) => {
    try {
      const response = await fetch(`${API_URL}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? Number(formData.cost) : null
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to schedule maintenance.");
      }

      showToast("success", `Maintenance scheduled for ${resData.make} ${resData.model}.`);
      setActiveModal(null);
      reset();
      loadData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Form submit: Update Maintenance
  const onEditSubmit = async (formData: any) => {
    if (!selectedRecord) return;
    try {
      const response = await fetch(`${API_URL}/maintenance/${selectedRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? Number(formData.cost) : null
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to update maintenance record.");
      }

      showToast("success", "Maintenance record updated successfully.");
      setActiveModal(null);
      setSelectedRecord(null);
      reset();
      loadData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Direct complete record submission
  const onCompleteSubmit = async (formData: any) => {
    if (!selectedRecord) return;
    try {
      const response = await fetch(`${API_URL}/maintenance/${selectedRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          completed_date: formData.completed_date || new Date().toISOString().split("T")[0],
          cost: formData.cost ? Number(formData.cost) : null,
          notes: formData.notes || ""
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to complete maintenance.");
      }

      showToast("success", "Maintenance marked as completed successfully.");
      setActiveModal(null);
      setSelectedRecord(null);
      reset();
      loadData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!selectedRecord) return;
    try {
      const response = await fetch(`${API_URL}/maintenance/${selectedRecord.id}`, {
        method: "DELETE"
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to delete record.");
      }

      showToast("success", "Maintenance record deleted successfully.");
      setActiveModal(null);
      setSelectedRecord(null);
      loadData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Open modals helper
  const openModal = (type: "add" | "edit" | "view" | "delete" | "complete", record?: MaintenanceRecord) => {
    setSelectedRecord(record || null);
    setActiveModal(type);

    if (type === "edit" && record) {
      setValue("vehicle_id", record.vehicle_id);
      setValue("type", record.type);
      setValue("description", record.description || "");
      setValue("status", record.status);
      setValue("scheduled_date", record.scheduled_date);
      setValue("completed_date", record.completed_date || "");
      setValue("cost", record.cost ? record.cost.toString() : "");
      setValue("notes", record.notes || "");
    } else if (type === "complete" && record) {
      setValue("completed_date", new Date().toISOString().split("T")[0]);
      setValue("cost", "");
      setValue("notes", record.notes || "");
    } else if (type === "add") {
      reset({
        vehicle_id: "",
        type: "Oil Change",
        description: "",
        status: "scheduled",
        scheduled_date: new Date().toISOString().split("T")[0],
        completed_date: "",
        cost: "",
        notes: ""
      });
    }
  };

  // Get chronological history of a specific vehicle
  const getVehicleHistory = (vehicleId: string) => {
    return records
      .filter((r) => r.vehicle_id === vehicleId)
      .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
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
            className="pb-3 border-b-2 border-[#F5A623] text-[#F5A623] flex items-center gap-2 transition-colors"
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

        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F0F4FF] tracking-tight flex items-center gap-2.5">
              <Wrench size={28} className="text-[#F5A623]" /> Maintenance Management
            </h1>
            <p className="text-xs md:text-sm text-[#6B7FA3] mt-1">
              Schedule services, log completions, track costs, and automatically lock in-shop vehicles.
            </p>
          </div>
          <button
            onClick={() => openModal("add")}
            className="btn-primary"
          >
            <Plus size={18} weight="bold" /> Schedule Maintenance
          </button>
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          
          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7FA3]">Total Services</span>
            <div className="text-xl md:text-2xl font-black text-[#F0F4FF] mt-1">{loading ? "..." : totalCount}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#f59e0b]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#f59e0b]">Scheduled</span>
            <div className="text-xl md:text-2xl font-black text-[#f59e0b] mt-1">{loading ? "..." : scheduledCount}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#3b82f6]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3b82f6]">In Progress</span>
            <div className="text-xl md:text-2xl font-black text-[#3b82f6] mt-1">{loading ? "..." : inProgressCount}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#10B981]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#10B981]">Completed</span>
            <div className="text-xl md:text-2xl font-black text-[#10B981] mt-1">{loading ? "..." : completedCount}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#a855f7] col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#a855f7] flex items-center gap-1">
              <CurrencyDollar size={12} /> Total Costs
            </span>
            <div className="text-xl md:text-2xl font-black text-[#a855f7] mt-1">
              {loading ? "..." : `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
          </div>
          
        </div>

        {/* Search, Filter Bar */}
        <div className="card-base bg-[#0D1526] p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:max-w-md">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]" size={18} />
            <input
              type="text"
              placeholder="Search by registration number, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-xs md:text-sm text-[#F0F4FF] placeholder-[#6B7FA3] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* Vehicle Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs md:text-sm text-[#6B7FA3] whitespace-nowrap">Vehicle:</span>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="w-full md:w-44 bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] cursor-pointer"
              >
                <option value="all">All Vehicles</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.registration_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs md:text-sm text-[#6B7FA3] whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-44 bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Maintenance Table Container */}
        {error ? (
          <div className="card-base bg-[#0D1526] border-red-500/20 p-8 text-center">
            <Warning size={42} className="text-[#ef4444] mx-auto mb-3" />
            <h3 className="font-bold text-[#F0F4FF]">Server Connection Failure</h3>
            <p className="text-xs text-[#6B7FA3] max-w-md mx-auto mt-1 mb-4">
              We couldn't connect to the backend server. Make sure the API server is active on `http://localhost:5000`.
            </p>
            <button onClick={loadData} className="btn-ghost text-xs">
              Retry Connection
            </button>
          </div>
        ) : loading ? (
          // Skeletons
          <div className="card-base bg-[#0D1526] p-1 divide-y divide-white/5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-40 bg-white/5 rounded" />
                  <div className="h-2.5 w-24 bg-white/5 rounded" />
                </div>
                <div className="h-3 w-28 bg-white/5 rounded" />
                <div className="h-3 w-16 bg-white/5 rounded" />
                <div className="h-8 w-32 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="card-base bg-[#0D1526] p-12 text-center">
            <Wrench size={48} className="text-[#3A4F73] mx-auto mb-3" />
            <h3 className="font-bold text-[#F0F4FF]">No Records Found</h3>
            <p className="text-xs text-[#6B7FA3] max-w-sm mx-auto mt-1">
              No services logged. Try clearing filters or schedule a new vehicle maintenance session.
            </p>
          </div>
        ) : (
          <div className="card-base bg-[#0D1526] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold text-[#6B7FA3] uppercase tracking-wider bg-white/[0.01]">
                  <th className="py-4 px-5">Vehicle & Registration</th>
                  <th className="py-4 px-5">Service Type</th>
                  <th className="py-4 px-5">Date details</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Cost</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs md:text-sm">
                {filteredRecords.map((r) => {
                  return (
                    <tr key={r.id} className="hover:bg-white/[0.01] transition-colors group">
                      
                      {/* Vehicle details */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#F0F4FF] group-hover:text-[#F5A623] transition-colors">
                          {r.make} {r.model}
                        </div>
                        <div className="text-[11px] font-mono text-[#6B7FA3] mt-0.5">
                          {r.registration_number}
                        </div>
                      </td>

                      {/* Service Type */}
                      <td className="py-4 px-5">
                        <div className="font-medium text-[#F0F4FF]">{r.type}</div>
                        {r.description && (
                          <div className="text-[11px] text-[#6B7FA3] truncate max-w-xs mt-0.5">{r.description}</div>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-5">
                        <div className="text-xs text-[#F0F4FF]">
                          <span className="text-[#6B7FA3]">Sched:</span> {r.scheduled_date}
                        </div>
                        {r.completed_date && (
                          <div className="text-[11px] text-[#10B981] mt-0.5">
                            <span>Done:</span> {r.completed_date}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {r.status === "scheduled" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#f59e0b] bg-[#f59e0b]/12 border border-[#f59e0b]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Scheduled
                          </span>
                        )}
                        {r.status === "in_progress" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#3b82f6] bg-[#3b82f6]/12 border border-[#3b82f6]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" /> In Progress
                          </span>
                        )}
                        {r.status === "completed" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#10B981] bg-[#10B981]/12 border border-[#10B981]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Completed
                          </span>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="py-4 px-5 font-mono text-[#F0F4FF] font-medium">
                        {r.cost ? `$${Number(r.cost).toFixed(2)}` : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openModal("view", r)}
                            title="View Record & History"
                            className="p-2 rounded bg-white/5 border border-white/5 text-[#F0F4FF] hover:bg-white/10 hover:border-white/10 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          
                          {r.status !== "completed" ? (
                            <>
                              <button
                                onClick={() => openModal("complete", r)}
                                title="Mark Completed"
                                className="p-2 rounded bg-white/5 border border-white/5 text-[#10B981] hover:bg-[#10B981]/10 hover:border-[#10B981]/20 transition-colors font-medium flex items-center gap-1 text-[11px] py-1"
                              >
                                <CheckCircle size={13} /> Complete
                              </button>
                              
                              <button
                                onClick={() => openModal("edit", r)}
                                title="Edit Maintenance"
                                className="p-2 rounded bg-white/5 border border-white/5 text-[#F5A623] hover:bg-[#F5A623]/10 hover:border-[#F5A623]/20 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-[#3A4F73] italic px-2">Read-Only</span>
                          )}

                          <button
                            onClick={() => openModal("delete", r)}
                            title="Delete Record"
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

      {/* MODALS OVERLAY (with AnimatePresence) */}
      <AnimatePresence>
        
        {/* SCHEDULE & EDIT MODAL */}
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
              className="card-base w-full max-w-xl bg-[#0D1526] z-10 max-h-[90vh] flex flex-col shadow-2xl relative"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-lg flex items-center gap-2">
                    {activeModal === "add" ? (
                      <>
                        <Plus size={20} className="text-[#F5A623]" /> Schedule Maintenance
                      </>
                    ) : (
                      <>
                        <Pencil size={20} className="text-[#F5A623]" /> Edit Maintenance Record
                      </>
                    )}
                  </h2>
                  <p className="text-[11px] text-[#6B7FA3] mt-0.5">
                    Assign vehicles to maintenance and update their shop status.
                  </p>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 rounded-full text-[#6B7FA3] hover:text-[#F0F4FF]">
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(activeModal === "add" ? onAddSubmit : onEditSubmit)}
                className="overflow-y-auto p-6 space-y-5 flex-1"
              >
                
                {/* Vehicle Selection dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Vehicle *</label>
                  {activeModal === "add" ? (
                    <select
                      {...register("vehicle_id", { required: "Vehicle is required" })}
                      className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
                    >
                      <option value="">Select an available/assigned vehicle...</option>
                      {selectableVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.make} {v.model} ({v.registration_number}) [Status: {v.status}]
                        </option>
                      ))}
                    </select>
                  ) : (
                    // Display vehicle name as read-only on edit
                    <div className="bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#6B7FA3] select-none font-medium">
                      {selectedRecord?.make} {selectedRecord?.model} ({selectedRecord?.registration_number})
                    </div>
                  )}
                  {errors.vehicle_id && activeModal === "add" && (
                    <p className="text-[10px] text-[#ef4444] mt-1">{errors.vehicle_id.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Maintenance Type */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Service Type *</label>
                    <select
                      {...register("type", { required: "Service type is required" })}
                      className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
                    >
                      <option value="Oil Change">Oil Change</option>
                      <option value="Tire Replacement">Tire Replacement</option>
                      <option value="Engine Service">Engine Service</option>
                      <option value="Brake Service">Brake Service</option>
                      <option value="General Inspection">General Inspection</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Maintenance Status *</label>
                    <select
                      {...register("status", { required: true })}
                      className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
                    >
                      {/* Prevent reverting in progress to scheduled */}
                      {!(activeModal === "edit" && selectedRecord?.status === "in_progress") && (
                        <option value="scheduled">Scheduled</option>
                      )}
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Scheduled Date */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Scheduled Date *</label>
                    <input
                      type="date"
                      {...register("scheduled_date", { required: "Scheduled date is required" })}
                      className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none"
                    />
                    {errors.scheduled_date && (
                      <p className="text-[10px] text-[#ef4444] mt-1">{errors.scheduled_date.message}</p>
                    )}
                  </div>

                  {/* Cost */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">
                      Cost ($) {watchedStatus !== "completed" && "(Optional)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 150.00"
                      {...register("cost", {
                        required: watchedStatus === "completed" ? "Cost is required on completion" : false,
                        validate: (val) => !val || Number(val) >= 0 || "Cost cannot be negative"
                      })}
                      className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
                    />
                    {errors.cost && (
                      <p className="text-[10px] text-[#ef4444] mt-1">{errors.cost.message}</p>
                    )}
                  </div>

                  {/* Completed Date (Only visible if status is completed) */}
                  {watchedStatus === "completed" && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Completed Date *</label>
                      <input
                        type="date"
                        {...register("completed_date", { required: "Completion date is required when status is Completed" })}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none"
                      />
                    </div>
                  )}

                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Details about issue..."
                    {...register("description")}
                    className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Internal tech notes..."
                    {...register("notes")}
                    className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                  <button type="button" onClick={() => setActiveModal(null)} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {activeModal === "add" ? "Schedule Service" : "Save Changes"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}

        {/* QUICK COMPLETE MODAL */}
        {activeModal === "complete" && selectedRecord && (
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
              className="card-base w-full max-w-md bg-[#0D1526] z-10 shadow-2xl relative p-6 space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <CheckCircle size={22} className="text-[#10B981]" />
                <div>
                  <h3 className="font-extrabold text-base text-[#F0F4FF]">Complete Maintenance</h3>
                  <p className="text-[10px] text-[#6B7FA3] mt-0.5">{selectedRecord.make} {selectedRecord.model} ({selectedRecord.registration_number})</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onCompleteSubmit)} className="space-y-4 text-xs md:text-sm">
                
                <div>
                  <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Completed Date *</label>
                  <input
                    type="date"
                    {...register("completed_date", { required: "Completed date is required" })}
                    className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Actual Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 120.00"
                    {...register("cost", { 
                      required: "Actual cost is required upon completion",
                      validate: (v) => Number(v) >= 0 || "Cost cannot be negative"
                    })}
                    className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
                  />
                  {errors.cost && (
                    <p className="text-[10px] text-[#ef4444] mt-1">{errors.cost.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Completion Notes / Details</label>
                  <textarea
                    rows={3}
                    placeholder="Describe parts replaced or tasks resolved..."
                    {...register("notes")}
                    className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-[#F0F4FF] focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div className="flex gap-3 justify-end border-t border-white/5 pt-4">
                  <button type="button" onClick={() => setActiveModal(null)} className="btn-ghost flex-1 justify-center">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    Log Completion
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}

        {/* DETAILS & VEHICLE CHRONOLOGICAL HISTORY MODAL */}
        {activeModal === "view" && selectedRecord && (
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
              className="card-base w-full max-w-2xl bg-[#0D1526] z-10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Top Details Header */}
              <div className="bg-[#111E35] p-5 border-b border-white/5 relative">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B7FA3] hover:text-[#F0F4FF] bg-[#070D1A]/50 hover:bg-[#070D1A]"
                >
                  <X size={16} />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center text-[#F5A623]">
                    <Wrench size={24} />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base md:text-lg text-[#F0F4FF] tracking-tight">
                      {selectedRecord.type}
                    </h2>
                    <p className="text-xs text-[#6B7FA3] mt-0.5">
                      {selectedRecord.make} {selectedRecord.model} • {selectedRecord.registration_number}
                    </p>
                  </div>
                </div>
              </div>

              {/* View Scroll Body */}
              <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs md:text-sm">
                
                {/* Columns layout */}
                <div className="grid grid-cols-3 gap-4">
                  
                  <div className="bg-[#111E35]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7FA3] block mb-1">Status</span>
                    {selectedRecord.status === "scheduled" && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded">Scheduled</span>
                    )}
                    {selectedRecord.status === "in_progress" && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded">In Shop</span>
                    )}
                    {selectedRecord.status === "completed" && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 rounded">Completed</span>
                    )}
                  </div>

                  <div className="bg-[#111E35]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7FA3] block mb-1">Service Date</span>
                    <strong className="text-[#F0F4FF]">{selectedRecord.scheduled_date}</strong>
                  </div>

                  <div className="bg-[#111E35]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7FA3] block mb-1">Cost</span>
                    <strong className="text-[#F0F4FF] font-mono">
                      {selectedRecord.cost ? `$${Number(selectedRecord.cost).toFixed(2)}` : "—"}
                    </strong>
                  </div>

                </div>

                {/* Details list */}
                <div className="space-y-4">
                  {selectedRecord.description && (
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] font-semibold uppercase tracking-wide mb-1">Service Description</span>
                      <div className="p-3 bg-[#070D1A] border border-white/5 rounded-lg text-[#F0F4FF] leading-relaxed">
                        {selectedRecord.description}
                      </div>
                    </div>
                  )}

                  {selectedRecord.notes && (
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] font-semibold uppercase tracking-wide mb-1">Internal Tech Notes</span>
                      <div className="p-3 bg-[#070D1A] border border-white/5 rounded-lg text-[#F0F4FF] leading-relaxed">
                        {selectedRecord.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Vehicle Chronological Maintenance History */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-2">
                    Chronological Maintenance History for {selectedRecord.make} {selectedRecord.model}
                  </h3>

                  <div className="space-y-2.5">
                    {getVehicleHistory(selectedRecord.vehicle_id).map((hist, idx) => {
                      return (
                        <div
                          key={hist.id}
                          className="p-3 bg-[#111E35]/30 border border-white/5 rounded-lg flex items-center justify-between text-xs hover:border-white/10 transition-colors"
                        >
                          <div>
                            <div className="font-bold text-[#F0F4FF]">{hist.type}</div>
                            <div className="text-[10px] text-[#6B7FA3] mt-0.5 flex gap-2">
                              <span>Date: {hist.scheduled_date}</span>
                              {hist.cost && <span>• Cost: ${Number(hist.cost).toFixed(2)}</span>}
                            </div>
                            {hist.notes && (
                              <div className="text-[10px] text-[#6B7FA3] mt-1 leading-relaxed max-w-md italic">
                                Notes: "{hist.notes}"
                              </div>
                            )}
                          </div>
                          
                          <div>
                            {hist.status === "scheduled" && (
                              <span className="px-2 py-0.5 text-[9px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 rounded border border-[#f59e0b]/15 uppercase">Scheduled</span>
                            )}
                            {hist.status === "in_progress" && (
                              <span className="px-2 py-0.5 text-[9px] font-bold text-[#3b82f6] bg-[#3b82f6]/10 rounded border border-[#3b82f6]/15 uppercase">In Shop</span>
                            )}
                            {hist.status === "completed" && (
                              <span className="px-2 py-0.5 text-[9px] font-bold text-[#10B981] bg-[#10B981]/10 rounded border border-[#10B981]/15 uppercase">Completed</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

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

        {/* DELETE CONFIRMATION MODAL */}
        {activeModal === "delete" && selectedRecord && (
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
              
              <h3 className="font-extrabold text-lg text-[#F0F4FF]">Delete Maintenance Record?</h3>
              <p className="text-xs text-[#6B7FA3] mt-2 mb-6">
                Are you sure you want to delete this <strong className="text-[#F0F4FF]">{selectedRecord.type}</strong> record for <strong className="text-[#F0F4FF]">{selectedRecord.make} {selectedRecord.model}</strong>? Deleting an active record will automatically release the vehicle back to 'Available' status.
              </p>

              <div className="flex gap-3 justify-center">
                <button onClick={() => setActiveModal(null)} className="btn-ghost flex-1 justify-center">
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

      {/* TOAST SYSTEM (Overlay) */}
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
