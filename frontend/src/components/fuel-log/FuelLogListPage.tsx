"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Funnel, MagnifyingGlass, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { FuelLog, FuelLogFilters, FuelLogMetadata } from "@/types/fuel-log";
import { fuelLogService } from "@/lib/fuelLog.service";
import { FuelLogShell } from "./FuelLogShell";
import { useToast } from "./ToastProvider";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ListSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-3xl border border-white/8 bg-[#111E35]" />
      ))}
    </div>
  );
}

export function FuelLogListPage() {
  const { pushToast } = useToast();
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [metadata, setMetadata] = useState<FuelLogMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FuelLogFilters>({
    page: 1,
    per_page: 10,
    sort: "newest",
  });
  const [meta, setMeta] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });
  const [deleteTarget, setDeleteTarget] = useState<FuelLog | null>(null);

  useEffect(() => {
    void fuelLogService
      .getMetadata()
      .then(setMetadata)
      .catch((error: Error) => pushToast(error.message, "error"));
  }, [pushToast]);

  useEffect(() => {
    setLoading(true);
    void fuelLogService
      .list(filters)
      .then((response) => {
        setLogs(response.items);
        setMeta(response.meta);
      })
      .catch((error: Error) => pushToast(error.message, "error"))
      .finally(() => setLoading(false));
  }, [filters, pushToast]);

  const applyFilter = (name: keyof FuelLogFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      page: 1,
      [name]: value,
    }));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fuelLogService.remove(deleteTarget.id);
      pushToast("Fuel log deleted successfully.", "success");
      setDeleteTarget(null);
      setFilters((current) => ({ ...current }));
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to delete fuel log.", "error");
    }
  };

  return (
    <FuelLogShell
      title="Fuel Log Management"
      subtitle="Track fuel purchases, monitor odometer progression, and keep station-level cost history ready for future analytics."
      actions={
        <Link href="/fuel-log/new" className="btn-primary">
          <Plus size={18} />
          New Fuel Log
        </Link>
      }
    >
      <section className="grid gap-6">
        <div className="rounded-[28px] border border-white/8 bg-[#0D1526] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#F0F4FF]">
            <Funnel size={18} />
            Filters
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 text-sm text-[#6B7FA3]">
              <span>Search</span>
              <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-[#070D1A] px-3">
                <MagnifyingGlass size={18} className="text-[#3A4F73]" />
                <input
                  value={filters.q || ""}
                  onChange={(event) => applyFilter("q", event.target.value)}
                  placeholder="Vehicle, driver, station, receipt"
                  className="w-full bg-transparent py-3 text-sm text-[#F0F4FF] outline-none placeholder:text-[#3A4F73]"
                />
              </div>
            </label>
            <label className="space-y-2 text-sm text-[#6B7FA3]">
              <span>Vehicle</span>
              <select
                value={filters.vehicle_id || ""}
                onChange={(event) => applyFilter("vehicle_id", event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-3 py-3 text-sm text-[#F0F4FF] outline-none"
              >
                <option value="">All vehicles</option>
                {metadata?.vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registration_number} - {vehicle.vehicle_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-[#6B7FA3]">
              <span>Driver</span>
              <select
                value={filters.driver_id || ""}
                onChange={(event) => applyFilter("driver_id", event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-3 py-3 text-sm text-[#F0F4FF] outline-none"
              >
                <option value="">All drivers</option>
                {metadata?.drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.driver_name} - {driver.license_number}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-[#6B7FA3]">
              <span>Fuel Type</span>
              <select
                value={filters.fuel_type || ""}
                onChange={(event) => applyFilter("fuel_type", event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-3 py-3 text-sm text-[#F0F4FF] outline-none"
              >
                <option value="">All fuel types</option>
                {metadata?.fuel_types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-[#6B7FA3]">
              <span>Trip</span>
              <select
                value={filters.trip_id || ""}
                onChange={(event) => applyFilter("trip_id", event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-3 py-3 text-sm text-[#F0F4FF] outline-none"
              >
                <option value="">All trips</option>
                {metadata?.trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.origin} to {trip.destination}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-[#6B7FA3]">
              <span>City</span>
              <input
                value={filters.city || ""}
                onChange={(event) => applyFilter("city", event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-3 py-3 text-sm text-[#F0F4FF] outline-none"
                placeholder="Filter by city"
              />
            </label>
            <label className="space-y-2 text-sm text-[#6B7FA3]">
              <span>State</span>
              <input
                value={filters.state || ""}
                onChange={(event) => applyFilter("state", event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-3 py-3 text-sm text-[#F0F4FF] outline-none"
                placeholder="Filter by state"
              />
            </label>
            <label className="space-y-2 text-sm text-[#6B7FA3]">
              <span>Sort</span>
              <select
                value={filters.sort || "newest"}
                onChange={(event) => applyFilter("sort", event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-3 py-3 text-sm text-[#F0F4FF] outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="cost">Highest cost</option>
                <option value="vehicle">Vehicle</option>
                <option value="driver">Driver</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-[#6B7FA3]">
              <span>From</span>
              <input
                type="date"
                value={filters.date_from || ""}
                onChange={(event) => applyFilter("date_from", event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-3 py-3 text-sm text-[#F0F4FF] outline-none"
              />
            </label>
            <label className="space-y-2 text-sm text-[#6B7FA3]">
              <span>To</span>
              <input
                type="date"
                value={filters.date_to || ""}
                onChange={(event) => applyFilter("date_to", event.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-3 py-3 text-sm text-[#F0F4FF] outline-none"
              />
            </label>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-[#0D1526] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#F0F4FF]">Fuel Log Table</h2>
              <p className="text-sm text-[#6B7FA3]">{meta.total} records found</p>
            </div>
          </div>

          {loading ? (
            <ListSkeleton />
          ) : logs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/12 bg-[#111E35] px-6 py-16 text-center">
              <h3 className="text-lg font-semibold text-[#F0F4FF]">No fuel logs yet</h3>
              <p className="mt-2 text-sm text-[#6B7FA3]">
                Start by creating a fuel entry to unlock station history, cost tracking, and vehicle fuel analytics.
              </p>
              <Link href="/fuel-log/new" className="btn-primary mt-6">
                Create Fuel Log
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/8 text-left text-sm">
                <thead>
                  <tr className="text-[#6B7FA3]">
                    {["Vehicle", "Driver", "Trip", "Fuel Station", "Fuel Type", "Quantity", "Price", "Total Cost", "Payment", "Filled Date", "Actions"].map(
                      (heading) => (
                        <th key={heading} className="px-3 py-3 font-medium">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {logs.map((log) => (
                    <tr key={log.id} className="align-top transition-colors hover:bg-white/[0.02]">
                      <td className="px-3 py-4">
                        <div className="font-medium text-[#F0F4FF]">{log.vehicle_registration_number}</div>
                        <div className="text-[#6B7FA3]">{log.vehicle_name}</div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="font-medium text-[#F0F4FF]">{log.driver_name}</div>
                        <div className="text-[#6B7FA3]">{log.driver_license_number}</div>
                      </td>
                      <td className="px-3 py-4 text-[#C7D2E6]">
                        {log.trip_id ? `${log.trip_origin} to ${log.trip_destination}` : "No trip linked"}
                      </td>
                      <td className="px-3 py-4 text-[#C7D2E6]">
                        <div className="font-medium text-[#F0F4FF]">{log.fuel_station_name}</div>
                        <div>{[log.city, log.state].filter(Boolean).join(", ") || "Location not provided"}</div>
                      </td>
                      <td className="px-3 py-4 capitalize text-[#C7D2E6]">{log.fuel_type}</td>
                      <td className="px-3 py-4 text-[#C7D2E6]">
                        {log.quantity} {log.unit}
                      </td>
                      <td className="px-3 py-4 text-[#C7D2E6]">
                        {formatCurrency(log.price_per_unit, log.currency)}
                      </td>
                      <td className="px-3 py-4 font-medium text-[#F5A623]">
                        {formatCurrency(log.total_cost, log.currency)}
                      </td>
                      <td className="px-3 py-4 capitalize text-[#C7D2E6]">{log.payment_method.replace("_", " ")}</td>
                      <td className="px-3 py-4 text-[#C7D2E6]">{formatDate(log.filled_at)}</td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/fuel-log/${log.id}`} className="btn-ghost !px-3 !py-2 !text-xs">
                            View
                          </Link>
                          <Link href={`/fuel-log/${log.id}/edit`} className="btn-ghost !px-3 !py-2 !text-xs">
                            <PencilSimple size={14} />
                            Edit
                          </Link>
                          <button onClick={() => setDeleteTarget(log)} className="btn-ghost !px-3 !py-2 !text-xs text-[#FCA5A5]">
                            <Trash size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#6B7FA3]">
              Page {meta.page} of {meta.total_pages}
            </p>
            <div className="flex gap-3">
              <button
                disabled={meta.page <= 1}
                onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, meta.page - 1) }))}
                className="btn-ghost disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={meta.page >= meta.total_pages}
                onClick={() => setFilters((current) => ({ ...current, page: meta.page + 1 }))}
                className="btn-ghost disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {deleteTarget ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/8 bg-[#0D1526] p-6 shadow-2xl">
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#F0F4FF]">Delete fuel log?</h3>
            <p className="mt-2 text-sm text-[#6B7FA3]">
              This will permanently remove the entry for {deleteTarget.vehicle_registration_number} at {deleteTarget.fuel_station_name}.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn-primary !bg-rose-600 !text-white hover:!bg-rose-700" onClick={() => void handleDelete()}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FuelLogShell>
  );
}
