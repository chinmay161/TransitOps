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
  X,
  FileText,
  ShieldCheck
} from "@phosphor-icons/react";
import { DemoSwitcher } from "../../components/DemoSwitcher";
import { DigiLockerVerificationBlocker } from "../../components/DigiLockerVerificationBlocker";

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Interface for Driver & Joined User details
interface Driver {
  id: string;
  user_id: string;
  license_number: string;
  license_expiry: string; // YYYY-MM-DD
  license_type: string | null;
  status: "available" | "on_trip" | "on_leave" | "inactive";
  emergency_contact: string | null;
  emergency_phone: string | null;
  hire_date: string; // YYYY-MM-DD
  fleet_manager_id: string | null;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;

  verification_status?: "pending" | "verified" | "failed";
  verification_source?: string | null;
  verification_date?: string | null;
  verification_id?: string | null;
}

// Toast notification interface
interface Toast {
  type: "success" | "error" | "warning";
  message: string;
  id: number;
}

export default function DriverManagementPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Modals state
  const [activeModal, setActiveModal] = useState<"add" | "edit" | "view" | "delete" | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Toasts state
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Form handling
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      license_number: "",
      license_type: "",
      license_expiry: "",
      status: "available",
      emergency_contact: "",
      emergency_phone: "",
      hire_date: new Date().toISOString().split("T")[0]
    }
  });

  // Watch license expiry for inline warnings
  const watchedLicenseExpiry = watch("license_expiry");

  // Fetch all drivers
  const loadDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/drivers`);
      if (!response.ok) {
        throw new Error("Failed to load drivers from server.");
      }
      const data = await response.json();
      setDrivers(data);
    } catch (err: any) {
      const message =
        err instanceof TypeError
          ? `Backend API is unavailable at ${API_URL}. Start PostgreSQL and the backend server, then retry.`
          : err.message || "An error occurred while loading drivers.";
      setError(message);
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  // Show animated toasts
  const showToast = (type: "success" | "error" | "warning", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { type, message, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Helper: check if license is expired
  const isLicenseExpired = (expiryDateStr: string) => {
    if (!expiryDateStr) return false;
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry < today;
  };

  // Filter & Search Logic
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Count helper functions for Stats Row
  const totalCount = drivers.length;
  const availableCount = drivers.filter(d => d.status === "available").length;
  const onTripCount = drivers.filter(d => d.status === "on_trip").length;
  const onLeaveCount = drivers.filter(d => d.status === "on_leave").length;
  const expiredLicensesCount = drivers.filter(d => isLicenseExpired(d.license_expiry)).length;

  // Add / Create submit handler
  const onAddSubmit = async (formData: any) => {
    try {
      const response = await fetch(`${API_URL}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.error || resData.errors?.join(", ") || "Failed to create driver");
      }
      
      showToast("success", `Driver ${formData.full_name} created successfully.`);
      setActiveModal(null);
      reset();
      loadDrivers();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Edit / Update submit handler
  const onEditSubmit = async (formData: any) => {
    if (!selectedDriver) return;
    try {
      const response = await fetch(`${API_URL}/drivers/${selectedDriver.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.error || resData.errors?.join(", ") || "Failed to update driver");
      }
      
      showToast("success", `Driver ${formData.full_name} updated successfully.`);
      setActiveModal(null);
      setSelectedDriver(null);
      reset();
      loadDrivers();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!selectedDriver) return;
    try {
      const response = await fetch(`${API_URL}/drivers/${selectedDriver.id}`, {
        method: "DELETE"
      });
      
      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.error || "Failed to delete driver");
      }
      
      showToast("success", `Driver was deleted successfully.`);
      setActiveModal(null);
      setSelectedDriver(null);
      loadDrivers();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  // Open modals helper
  const openModal = (type: "add" | "edit" | "view" | "delete", driver?: Driver) => {
    setSelectedDriver(driver || null);
    setActiveModal(type);
    
    if (type === "edit" && driver) {
      setValue("full_name", driver.full_name);
      setValue("email", driver.email);
      setValue("phone", driver.phone || "");
      setValue("license_number", driver.license_number);
      setValue("license_type", driver.license_type || "");
      setValue("license_expiry", driver.license_expiry);
      setValue("status", driver.status);
      setValue("emergency_contact", driver.emergency_contact || "");
      setValue("emergency_phone", driver.emergency_phone || "");
      setValue("hire_date", driver.hire_date);
    } else if (type === "add") {
      reset({
        full_name: "",
        email: "",
        phone: "",
        license_number: "",
        license_type: "",
        license_expiry: "",
        status: "available",
        emergency_contact: "",
        emergency_phone: "",
        hire_date: new Date().toISOString().split("T")[0]
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
            className="pb-3 border-b-2 border-[#F5A623] text-[#F5A623] flex items-center gap-2 transition-colors"
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
            className="pb-3 border-b-2 border-transparent text-[#6B7FA3] flex items-center gap-2 hover:text-[#F0F4FF] hover:border-white/10 transition-colors"
          >
            <ShieldCheck size={16} /> Trips
          </a>
        </div>
        
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F0F4FF] tracking-tight flex items-center gap-2.5">
              <User size={28} className="text-[#F5A623]" /> Driver Management
            </h1>
            <p className="text-xs md:text-sm text-[#6B7FA3] mt-1">
              Add, inspect, edit, and deactivate active fleet drivers. Complete lifecycle management.
            </p>
          </div>
          <button
            onClick={() => openModal("add")}
            className="btn-primary"
          >
            <Plus size={18} weight="bold" /> Add Fleet Driver
          </button>
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          
          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7FA3]">Total Drivers</span>
            <div className="text-xl md:text-2xl font-black text-[#F0F4FF] mt-1">{loading ? "..." : totalCount}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#10B981]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#10B981]">Available</span>
            <div className="text-xl md:text-2xl font-black text-[#10B981] mt-1">{loading ? "..." : availableCount}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#3b82f6]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3b82f6]">On Trip</span>
            <div className="text-xl md:text-2xl font-black text-[#3b82f6] mt-1">{loading ? "..." : onTripCount}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#f59e0b]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#f59e0b]">On Leave</span>
            <div className="text-xl md:text-2xl font-black text-[#f59e0b] mt-1">{loading ? "..." : onLeaveCount}</div>
          </div>

          <div className="card-base p-4 bg-[#0D1526] hover:border-white/10 transition-colors border-l-4 border-l-[#ef4444] col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#ef4444] flex items-center gap-1">
              <Warning size={12} /> Expired Licenses
            </span>
            <div className="text-xl md:text-2xl font-black text-[#ef4444] mt-1">{loading ? "..." : expiredLicensesCount}</div>
          </div>
          
        </div>

        {/* Search, Filter Bar */}
        <div className="card-base bg-[#0D1526] p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:max-w-md">
            <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7FA3]" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-xs md:text-sm text-[#F0F4FF] placeholder-[#6B7FA3] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#6B7FA3] whitespace-nowrap">
              <Funnel size={16} /> Filter Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-44 bg-[#070D1A] border border-white/5 rounded-lg py-2.5 px-3.5 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] cursor-pointer"
            >
              <option value="all">All Drivers</option>
              <option value="available">Available (Green)</option>
              <option value="on_trip">On Trip (Blue)</option>
              <option value="on_leave">On Leave (Orange)</option>
              <option value="inactive">Inactive (Gray)</option>
            </select>
          </div>
        </div>

        {/* Drivers Table & Container */}
        {error ? (
          <div className="card-base bg-[#0D1526] border-red-500/20 p-8 text-center">
            <Warning size={42} className="text-[#ef4444] mx-auto mb-3" />
            <h3 className="font-bold text-[#F0F4FF]">Server Connection Failure</h3>
            <p className="text-xs text-[#6B7FA3] max-w-md mx-auto mt-1 mb-4">
              We couldn't connect to the backend server. Make sure the API server is active on `http://localhost:5000`.
            </p>
            <button onClick={loadDrivers} className="btn-ghost text-xs">
              Retry Connection
            </button>
          </div>
        ) : loading ? (
          // Shimmer loading skeletons
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
        ) : filteredDrivers.length === 0 ? (
          // Empty State
          <div className="card-base bg-[#0D1526] p-12 text-center">
            <User size={48} className="text-[#3A4F73] mx-auto mb-3" />
            <h3 className="font-bold text-[#F0F4FF]">No Drivers Found</h3>
            <p className="text-xs text-[#6B7FA3] max-w-sm mx-auto mt-1">
              Try adjusting your search criteria, clearing filters, or create a brand new fleet driver profile to get started.
            </p>
          </div>
        ) : (
          // Data Table
          <div className="card-base bg-[#0D1526] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold text-[#6B7FA3] uppercase tracking-wider bg-white/[0.01]">
                  <th className="py-4 px-5">Full Name & Contact</th>
                  <th className="py-4 px-5">License Details</th>
                  <th className="py-4 px-5">License Expiry</th>
                  <th className="py-4 px-5">Verification</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Hire Date</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs md:text-sm">
                {filteredDrivers.map((driver) => {
                  const expired = isLicenseExpired(driver.license_expiry);
                  return (
                    <tr
                      key={driver.id}
                      className="hover:bg-white/[0.01] transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#162440] flex items-center justify-center text-[#F5A623] font-bold text-xs uppercase border border-white/5">
                            {driver.full_name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-[#F0F4FF] group-hover:text-[#F5A623] transition-colors">
                              {driver.full_name}
                            </div>
                            <div className="text-[11px] text-[#6B7FA3] mt-0.5 flex flex-col gap-0.5">
                              <span className="flex items-center gap-1">
                                <Envelope size={11} /> {driver.email}
                              </span>
                              {driver.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={11} /> {driver.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* License details */}
                      <td className="py-4 px-5">
                        <div className="font-mono text-[#F0F4FF] font-medium">{driver.license_number}</div>
                        <div className="text-[11px] text-[#6B7FA3] mt-0.5">
                          {driver.license_type || "Standard Class"}
                        </div>
                      </td>

                      {/* License Expiry */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className={expired ? "text-[#ef4444] font-medium" : "text-[#F0F4FF]"}>
                            {driver.license_expiry}
                          </span>
                          {expired && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-[#ef4444]/12 text-[#ef4444] rounded border border-[#ef4444]/20 uppercase tracking-wide">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-4 px-5 relative group/verify-tooltip">
                        {driver.verification_status === "verified" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#10B981] bg-[#10B981]/12 border border-[#10B981]/20 rounded-full cursor-help">
                            <CheckCircle size={12} className="text-[#10B981]" /> Verified
                          </span>
                        ) : driver.verification_status === "failed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#ef4444] bg-[#ef4444]/12 border border-[#ef4444]/20 rounded-full">
                            <XCircle size={12} className="text-[#ef4444]" /> Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#f59e0b] bg-[#f59e0b]/12 border border-[#f59e0b]/20 rounded-full">
                            <Warning size={12} className="text-[#f59e0b]" /> Pending
                          </span>
                        )}

                        {/* Verification Details Tooltip on Hover */}
                        {driver.verification_status === "verified" && (
                          <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[#111E35] border border-white/10 p-3 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover/verify-tooltip:opacity-100 transition-opacity duration-150 text-[10px] space-y-1 text-left">
                            <div className="font-bold text-[#F0F4FF] pb-1 border-b border-white/5 uppercase tracking-wide text-[9px] text-center text-[#F5A623]">DigiLocker Record</div>
                            <div><span className="text-[#6B7FA3]">Source:</span> <strong className="text-[#F0F4FF]">{driver.verification_source}</strong></div>
                            <div><span className="text-[#6B7FA3]">Verified:</span> <strong className="text-[#F0F4FF]">{driver.verification_date ? new Date(driver.verification_date).toLocaleDateString() : ""}</strong></div>
                            <div><span className="text-[#6B7FA3]">Ref ID:</span> <strong className="text-[#F0F4FF] font-mono">{driver.verification_id}</strong></div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {driver.status === "available" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#10B981] bg-[#10B981]/12 border border-[#10B981]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Available
                          </span>
                        )}
                        {driver.status === "on_trip" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#3b82f6] bg-[#3b82f6]/12 border border-[#3b82f6]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" /> On Trip
                          </span>
                        )}
                        {driver.status === "on_leave" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#f59e0b] bg-[#f59e0b]/12 border border-[#f59e0b]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> On Leave
                          </span>
                        )}
                        {driver.status === "inactive" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#6B7FA3] bg-[#6B7FA3]/12 border border-[#6B7FA3]/20 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6B7FA3]" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Hire date */}
                      <td className="py-4 px-5 text-[#6B7FA3] font-medium">{driver.hire_date}</td>

                      {/* Action buttons */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openModal("view", driver)}
                            title="View Profile Details"
                            className="p-2 rounded bg-white/5 border border-white/5 text-[#F0F4FF] hover:bg-white/10 hover:border-white/10 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openModal("edit", driver)}
                            title="Edit Driver"
                            className="p-2 rounded bg-white/5 border border-white/5 text-[#F5A623] hover:bg-[#F5A623]/10 hover:border-[#F5A623]/20 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => openModal("delete", driver)}
                            title="Delete Driver"
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
        
        {/* ADD & EDIT DRIVER MODAL */}
        {(activeModal === "add" || activeModal === "edit") && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="card-base w-full max-w-2xl bg-[#0D1526] z-10 max-h-[90vh] flex flex-col shadow-2xl relative"
            >
              
              {/* Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-lg flex items-center gap-2">
                    {activeModal === "add" ? (
                      <>
                        <Plus size={20} className="text-[#F5A623]" /> Add Fleet Driver
                      </>
                    ) : (
                      <>
                        <Pencil size={20} className="text-[#F5A623]" /> Edit Driver Profile
                      </>
                    )}
                  </h2>
                  <p className="text-[11px] text-[#6B7FA3] mt-0.5">
                    Fill in both account details and driving license records.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-full text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form wrapper */}
              <form
                onSubmit={handleSubmit(activeModal === "add" ? onAddSubmit : onEditSubmit)}
                className="overflow-y-auto p-6 space-y-6 flex-1"
              >
                {/* Expired Warning Banner */}
                {watchedLicenseExpiry && isLicenseExpired(watchedLicenseExpiry) && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-[#ef4444]">
                    <Warning size={18} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">License Expiry Alert:</strong> The selected license expiry date ({watchedLicenseExpiry}) is in the past. Saving this driver will flag them as "Expired".
                    </div>
                  </div>
                )}

                {/* Section A: User Account Details */}
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-2 mb-4 flex items-center gap-1.5">
                    <User size={14} /> Profile Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        {...register("full_name", { required: "Full name is required" })}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.full_name && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        placeholder="john.doe@example.com"
                        {...register("email", { 
                          required: "Email address is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email format"
                          }
                        })}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.email && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+1234567890"
                        {...register("phone", {
                          pattern: {
                            value: /^\+?[0-9\s\-\(\)]{7,20}$/,
                            message: "Invalid phone format. Must be 7-20 digits (allowed: +, -, space, brackets)"
                          }
                        })}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.phone && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section B: License and Professional Details */}
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-2 mb-4 flex items-center gap-1.5">
                    <IdentificationCard size={14} /> License & Registry Records
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">License Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. DL-98765432"
                        {...register("license_number", { required: "License number is required" })}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.license_number && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.license_number.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">License Class / Type</label>
                      <input
                        type="text"
                        placeholder="e.g. CDL Class A"
                        {...register("license_type")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">License Expiry Date *</label>
                      <input
                        type="date"
                        {...register("license_expiry", { required: "License expiry date is required" })}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.license_expiry && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.license_expiry.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Hire Date *</label>
                      <input
                        type="date"
                        {...register("hire_date", { 
                          required: "Hire date is required",
                          validate: (val) => {
                            const date = new Date(val);
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            return date <= today || "Hire date cannot be in the future";
                          }
                        })}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.hire_date && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.hire_date.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Driver Status *</label>
                      <select
                        {...register("status", { required: true })}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors cursor-pointer"
                      >
                        <option value="available">Available (Green)</option>
                        <option value="on_trip">On Trip (Blue)</option>
                        <option value="on_leave">On Leave (Orange)</option>
                        <option value="inactive">Inactive (Gray)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section C: Emergency Contacts */}
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-2 mb-4 flex items-center gap-1.5">
                    <Phone size={14} /> Emergency Support Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Emergency Contact Name</label>
                      <input
                        type="text"
                        placeholder="Jane Doe"
                        {...register("emergency_contact")}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6B7FA3] mb-1.5">Emergency Phone</label>
                      <input
                        type="text"
                        placeholder="+1987654321"
                        {...register("emergency_phone", {
                          pattern: {
                            value: /^\+?[0-9\s\-\(\)]{7,20}$/,
                            message: "Invalid emergency phone format. Must be 7-20 digits."
                          }
                        })}
                        className="w-full bg-[#070D1A] border border-white/5 rounded-lg py-2 px-3 text-xs md:text-sm text-[#F0F4FF] focus:outline-none focus:border-[#F5A623] transition-colors"
                      />
                      {errors.emergency_phone && (
                        <p className="text-[10px] text-[#ef4444] mt-1 flex items-center gap-0.5">
                          <XCircle size={10} /> {errors.emergency_phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Footer Buttons */}
                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {activeModal === "add" ? "Create Profile" : "Save Changes"}
                  </button>
                </div>
                
              </form>
              
            </motion.div>
          </div>
        )}

        {/* VIEW DETAILS MODAL */}
        {activeModal === "view" && selectedDriver && (
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
              {/* Header card banner */}
              <div className="bg-[#111E35] p-6 border-b border-white/5 relative">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B7FA3] hover:text-[#F0F4FF] transition-colors bg-[#070D1A]/50 hover:bg-[#070D1A]"
                >
                  <X size={16} />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 flex items-center justify-center text-[#F5A623] font-bold text-xl uppercase">
                    {selectedDriver.full_name.substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-xl text-[#F0F4FF] tracking-tight">{selectedDriver.full_name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#6B7FA3]">{selectedDriver.email}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                      <span className="text-xs text-[#6B7FA3]">ID: {selectedDriver.id.split("-")[0]}...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                
                {/* Status and Licenses */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111E35]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7FA3] block mb-1">Status</span>
                    {selectedDriver.status === "available" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-[#10B981] bg-[#10B981]/12 border border-[#10B981]/20 rounded">
                        Available
                      </span>
                    )}
                    {selectedDriver.status === "on_trip" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-[#3b82f6] bg-[#3b82f6]/12 border border-[#3b82f6]/20 rounded">
                        On Trip
                      </span>
                    )}
                    {selectedDriver.status === "on_leave" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/12 border border-[#f59e0b]/20 rounded">
                        On Leave
                      </span>
                    )}
                    {selectedDriver.status === "inactive" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-[#6B7FA3] bg-[#6B7FA3]/12 border border-[#6B7FA3]/20 rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="bg-[#111E35]/40 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7FA3] block mb-1">License Expiry</span>
                    <div className="flex items-center gap-1.5">
                      <span className={isLicenseExpired(selectedDriver.license_expiry) ? "text-[#ef4444] font-bold text-sm" : "text-sm text-[#F0F4FF]"}>
                        {selectedDriver.license_expiry}
                      </span>
                      {isLicenseExpired(selectedDriver.license_expiry) && (
                        <span className="px-1.5 py-0.2 text-[8px] bg-[#ef4444]/10 text-[#ef4444] font-bold uppercase border border-[#ef4444]/20 rounded">Expired</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Driver Details details */}
                <div className="space-y-3.5">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-1">Professional Details</h3>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs md:text-sm">
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">License Number</span>
                      <strong className="text-[#F0F4FF] font-medium font-mono">{selectedDriver.license_number}</strong>
                    </div>
                    
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">License Type / Class</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedDriver.license_type || "N/A"}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Contact Phone</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedDriver.phone || "N/A"}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Hire Date</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedDriver.hire_date}</strong>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-3.5">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-1">Emergency Support Details</h3>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs md:text-sm">
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Contact Person</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedDriver.emergency_contact || "N/A"}</strong>
                    </div>
                    
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Contact Phone</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedDriver.emergency_phone || "N/A"}</strong>
                    </div>
                  </div>
                </div>

                {/* License Verification Section */}
                <div className="space-y-3.5">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#F5A623] border-b border-white/5 pb-1 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-[#10B981]" /> License Verification Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs md:text-sm">
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Verification Status</span>
                      {selectedDriver.verification_status === "verified" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/12 border border-[#10B981]/20 rounded uppercase">Verified</span>
                      ) : selectedDriver.verification_status === "failed" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-[#ef4444] bg-[#ef4444]/12 border border-[#ef4444]/20 rounded uppercase">Failed</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/12 border border-[#f59e0b]/20 rounded uppercase">Pending</span>
                      )}
                    </div>
                    
                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Verification Source</span>
                      <strong className="text-[#F0F4FF] font-medium">{selectedDriver.verification_source || "N/A"}</strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Verification Date</span>
                      <strong className="text-[#F0F4FF] font-medium">
                        {selectedDriver.verification_date ? new Date(selectedDriver.verification_date).toLocaleString() : "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#6B7FA3] block text-[11px] mb-0.5">Verification ID</span>
                      <strong className="text-[#F0F4FF] font-medium font-mono">{selectedDriver.verification_id || "N/A"}</strong>
                    </div>
                  </div>
                </div>

                {/* Audit trail */}
                <div className="bg-[#111E35]/20 p-3.5 rounded-lg border border-white/5 text-[10px] text-[#6B7FA3] flex justify-between">
                  <span>Profile Created: {new Date(selectedDriver.created_at).toLocaleString()}</span>
                  <span>Last Updated: {new Date(selectedDriver.updated_at).toLocaleString()}</span>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-[#111E35]/40 border-t border-white/5 flex justify-end gap-2.5">
                <button
                  onClick={() => openModal("edit", selectedDriver)}
                  className="btn-ghost"
                >
                  <Pencil size={14} /> Edit Profile
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {activeModal === "delete" && selectedDriver && (
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
              
              <h3 className="font-extrabold text-lg text-[#F0F4FF]">Delete Driver Profile?</h3>
              <p className="text-xs text-[#6B7FA3] mt-2 mb-6">
                Are you sure you want to delete <strong className="text-[#F0F4FF]">{selectedDriver.full_name}</strong>? This action will cascade and permanently delete their driving records and associated user profile.
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
