"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ModuleShell } from "@/components/app/ModuleShell";
import { fetchRoleDashboard } from "@/lib/dashboard.service";
import {
  CaretRight,
  MapPin,
  Calendar,
  GasPump,
  Bell,
  Warning,
  CheckCircle,
  Clock,
  NavigationArrow,
  Flag,
  RoadHorizon,
  Spinner,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string | null;
  actual_end?: string | null;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

interface FuelLog {
  id: string;
  fuel_station_name: string;
  total_cost: number;
  quantity: number;
  filled_at: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  created_at: string;
  status: "unread" | "read";
}

interface DriverDashboardData {
  current_trip: Trip | null;
  todays_trips: Trip[];
  upcoming_trips: Trip[];
  completed_trips: Trip[];
  fuel_logs: FuelLog[];
  notifications: {
    unread: NotificationItem[];
    read: NotificationItem[];
  };
}

export default function DriverDashboardPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DriverDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"trips" | "fuel" | "notifications">("trips");
  const [odometerInput, setOdometerInput] = useState("");
  const [submittingTrip, setSubmittingTrip] = useState<string | null>(null);

  const loadDashboard = async () => {
    if (!user?.driver_id) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchRoleDashboard("driver", { driver_id: user.driver_id });
      setDashboardData(data as unknown as DriverDashboardData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load driver dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadDashboard();
    }
  }, [authLoading, user?.driver_id]);

  const handleStartTrip = async (tripId: string) => {
    setSubmittingTrip(tripId);
    try {
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/start`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start trip");
      }
      toast.success("Trip started successfully! Drive safely.");
      loadDashboard();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmittingTrip(null);
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    if (!odometerInput || isNaN(Number(odometerInput))) {
      toast.error("Please enter a valid final odometer reading.");
      return;
    }
    setSubmittingTrip(tripId);
    try {
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ final_odometer: Number(odometerInput) }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete trip");
      }
      toast.success("Trip completed successfully. Great job!");
      setOdometerInput("");
      loadDashboard();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmittingTrip(null);
    }
  };

  if (authLoading || loading) {
    return (
      <ModuleShell title="Driver Dashboard">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner className="animate-spin text-[var(--amber)]" size={44} />
          <p className="text-sm text-[var(--text-secondary)]">Loading dashboard data...</p>
        </div>
      </ModuleShell>
    );
  }

  if (role !== "driver") {
    return (
      <ModuleShell title="Unauthorized">
        <div className="card-base bg-[#0D1526] p-8 text-center border-red-500/20">
          <Warning size={42} className="text-[var(--red)] mx-auto mb-3" />
          <h3 className="font-bold text-[var(--text-primary)]">Access Denied</h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mt-1 mb-4">
            This dashboard is only accessible for logged-in Drivers.
          </p>
          <Link href="/" className="btn-primary text-xs">
            Back to Home
          </Link>
        </div>
      </ModuleShell>
    );
  }

  const activeTrip = dashboardData?.current_trip;
  const unreadNotifications = dashboardData?.notifications?.unread || [];
  const readNotifications = dashboardData?.notifications?.read || [];
  const allNotifications = [...unreadNotifications, ...readNotifications];

  return (
    <ModuleShell title={`Welcome back, ${user?.full_name || "Driver"}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Middle Columns - Active Trip & Lists */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Active Trip Section */}
          <div className="rounded-[24px] border border-white/8 bg-gradient-to-b from-[#0D1526] to-[#0A0F1D] p-6 shadow-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-24 -top-24 w-48 h-48 bg-[var(--amber-light)] blur-[64px] rounded-full" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                <NavigationArrow size={20} className="text-[var(--amber)]" weight="fill" /> Active Assignment
              </h2>
              {activeTrip ? (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border border-emerald-500/20 bg-emerald-500/10 text-[var(--emerald)] animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--emerald)]" />
                  In Progress
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border border-white/10 bg-white/5 text-[var(--text-secondary)]">
                  No Active Trip
                </span>
              )}
            </div>

            {activeTrip ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Origin */}
                  <div className="flex items-start gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    <MapPin size={24} className="text-[var(--amber)] mt-1" weight="duotone" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Start Location</span>
                      <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{activeTrip.origin}</p>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-start gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    <MapPin size={24} className="text-[var(--emerald)] mt-1" weight="duotone" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Destination</span>
                      <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{activeTrip.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Clock size={16} />
                    <span>
                      Scheduled: {new Date(activeTrip.scheduled_start).toLocaleString()} -{" "}
                      {new Date(activeTrip.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Odometer & Complete Form */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                      type="number"
                      placeholder="Final Odometer"
                      value={odometerInput}
                      onChange={(e) => setOdometerInput(e.target.value)}
                      className="bg-[#070D1A] border border-white/10 rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--amber)] transition-colors w-full md:w-32"
                    />
                    <button
                      onClick={() => handleCompleteTrip(activeTrip.id)}
                      disabled={submittingTrip === activeTrip.id}
                      className="btn-primary text-xs !py-2 shadow-md w-full md:w-auto"
                      style={{ background: "var(--emerald)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}
                    >
                      {submittingTrip === activeTrip.id ? <Spinner className="animate-spin" size={14} /> : <Flag size={14} weight="bold" />}
                      Complete Trip
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-white/[0.01] border border-dashed border-white/8 rounded-xl">
                <MapPin size={38} className="text-[var(--text-muted)] mx-auto mb-2" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Ready for Dispatch</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs mx-auto">
                  When a dispatcher assigns a trip to you, details will appear here to start your journey.
                </p>
              </div>
            )}
          </div>

          {/* Details / Tab List Section */}
          <div className="rounded-[24px] border border-white/8 bg-[#0D1526] p-6 shadow-xl">
            {/* Custom Tab Selector */}
            <div className="flex border-b border-white/5 mb-6 gap-6 text-xs md:text-sm font-semibold">
              <button
                onClick={() => setActiveTab("trips")}
                className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "trips" ? "border-[var(--amber)] text-[var(--amber)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <RoadHorizon size={16} /> Trip Schedule
              </button>
              <button
                onClick={() => setActiveTab("fuel")}
                className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "fuel" ? "border-[var(--amber)] text-[var(--amber)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <GasPump size={16} /> Fuel Entries
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "notifications" ? "border-[var(--amber)] text-[var(--amber)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Bell size={16} /> Alerts ({unreadNotifications.length})
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "trips" && (
                <motion.div
                  key="trips"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  {/* Today's Pending Trips */}
                  {dashboardData?.todays_trips && dashboardData.todays_trips.filter(t => t.status === "scheduled").map((trip) => (
                    <div
                      key={trip.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors gap-4"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                          <span>{trip.origin}</span>
                          <CaretRight size={14} className="text-[var(--text-secondary)]" />
                          <span>{trip.destination}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                          <Clock size={12} />
                          <span>Scheduled: {new Date(trip.scheduled_start).toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartTrip(trip.id)}
                        disabled={submittingTrip === trip.id}
                        className="btn-primary text-xs py-1.5 px-4"
                      >
                        {submittingTrip === trip.id ? <Spinner className="animate-spin" size={12} /> : <NavigationArrow size={12} weight="bold" />}
                        Start Journey
                      </button>
                    </div>
                  ))}

                  {/* Upcoming / Completed list placeholder */}
                  {(!dashboardData?.todays_trips || dashboardData.todays_trips.length === 0) && (
                    <p className="text-xs text-[var(--text-secondary)] text-center py-6">No scheduled trips today.</p>
                  )}

                  {/* Upcoming Trips Section */}
                  {dashboardData?.upcoming_trips && dashboardData.upcoming_trips.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs uppercase font-bold text-[var(--text-secondary)] tracking-wider mb-3">Upcoming Schedules</h4>
                      <div className="flex flex-col gap-3">
                        {dashboardData.upcoming_trips.map((trip) => (
                          <div key={trip.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                            <span className="font-semibold text-[var(--text-primary)]">{trip.origin} → {trip.destination}</span>
                            <span className="text-[var(--text-secondary)]">{new Date(trip.scheduled_start).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "fuel" && (
                <motion.div
                  key="fuel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase font-bold text-[var(--text-secondary)] tracking-wider">Refueling Logs</h4>
                    <Link href="/fuel-log/new" className="text-xs font-semibold text-[var(--amber)] hover:underline flex items-center gap-1">
                      + Add Fuel Entry
                    </Link>
                  </div>

                  <div className="flex flex-col gap-3">
                    {dashboardData?.fuel_logs && dashboardData.fuel_logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] text-xs"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-[var(--text-primary)]">{log.fuel_station_name}</span>
                          <span className="text-[var(--text-secondary)]">{new Date(log.filled_at).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[var(--text-primary)]">₹{log.total_cost.toLocaleString()}</div>
                          <span className="text-[var(--text-secondary)]">{log.quantity} L</span>
                        </div>
                      </div>
                    ))}
                    {(!dashboardData?.fuel_logs || dashboardData.fuel_logs.length === 0) && (
                      <p className="text-xs text-[var(--text-secondary)] text-center py-6">No recent fuel logs recorded.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-3"
                >
                  {allNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-xl border text-xs flex gap-3 items-start ${
                        notif.status === "unread" ? "border-amber-500/25 bg-amber-500/[0.02]" : "border-white/5 bg-white/[0.01]"
                      }`}
                    >
                      <CheckCircle className={`mt-0.5 ${notif.status === "unread" ? "text-[var(--amber)]" : "text-[var(--text-muted)]"}`} size={16} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[var(--text-primary)]">{notif.title}</span>
                          <span className="text-[10px] text-[var(--text-secondary)]">{new Date(notif.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[var(--text-secondary)] mt-1">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                  {allNotifications.length === 0 && (
                    <p className="text-xs text-[var(--text-secondary)] text-center py-6">No notifications found.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar Column - Driver Profile & Quick Stats */}
        <div className="flex flex-col gap-6">
          {/* Driver Profile Summary Widget */}
          <div className="rounded-[24px] border border-white/8 bg-[#0D1526] p-6 shadow-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#162440] flex items-center justify-center text-[var(--amber)] font-black text-lg uppercase border border-white/10 mb-4">
              {user?.full_name?.substring(0, 2) || "DR"}
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">{user?.full_name}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{user?.email}</p>
            {user?.phone && <p className="text-xs text-[var(--text-muted)] mt-0.5">{user.phone}</p>}
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border border-amber-500/25 bg-amber-500/10 text-[var(--amber)] mt-3">
              Fleet Driver
            </span>
          </div>

          {/* Quick Metrics Widget */}
          <div className="rounded-[24px] border border-white/8 bg-[#0D1526] p-6 shadow-xl">
            <h3 className="text-xs uppercase font-bold text-[var(--text-secondary)] tracking-wider mb-4">Performance Metrics</h3>
            <div className="flex flex-col gap-4">
              {/* Stat 1 */}
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                  <RoadHorizon size={14} /> Trips Completed
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {dashboardData?.completed_trips?.length || 0}
                </span>
              </div>

              {/* Stat 2 */}
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                  <GasPump size={14} /> Refuelings Logged
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {dashboardData?.fuel_logs?.length || 0}
                </span>
              </div>

              {/* Stat 3 */}
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Clock size={14} /> Total Alerts
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {allNotifications.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}
