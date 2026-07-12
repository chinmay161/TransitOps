"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchDashboardFilterMetadata, fetchRoleDashboard } from "@/lib/dashboard.service";
import { DashboardDatum, DashboardFilters, DashboardMetric } from "@/types/dashboard";
import { DashboardShell } from "./DashboardShell";
import {
  ChartCard,
  DashboardSection,
  DataTable,
  LoadingDashboard,
  MetricGrid,
  StatTiles,
  formatKey,
} from "./DashboardWidgets";

type DashboardBundle = Awaited<ReturnType<typeof fetchRoleDashboard>>;
type DashboardFilterMetadata = Awaited<ReturnType<typeof fetchDashboardFilterMetadata>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isMetricArray(value: unknown): value is DashboardMetric[] {
  return Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.id === "string" && typeof item.value === "number");
}

function isChartArray(value: unknown): value is DashboardDatum[] {
  return Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.label === "string" && typeof item.value === "number");
}

function isTableArray(value: unknown): value is Array<Record<string, unknown>> {
  return Array.isArray(value) && value.length > 0 && value.every((item) => isRecord(item));
}

function chartTypeForKey(key: string): "line" | "bar" | "pie" | "area" {
  if (key.includes("trend")) return key.includes("consumption") ? "area" : "line";
  if (key.includes("distribution") || key.includes("status")) return "pie";
  if (key.includes("breakdown")) return "pie";
  return "bar";
}

function renderSummaryObject(value: Record<string, unknown>) {
  const items = Object.entries(value)
    .filter(([, entry]) => typeof entry === "number")
    .map(([key, entry]) => ({
      label: formatKey(key),
      value: Number(entry),
    }));

  if (items.length === 0) {
    return null;
  }

  return <StatTiles items={items} />;
}

function renderWidget(key: string, value: unknown) {
  if (isMetricArray(value)) {
    return <MetricGrid metrics={value} />;
  }

  if (isChartArray(value)) {
    return <ChartCard title={formatKey(key)} type={chartTypeForKey(key)} data={value} />;
  }

  if (Array.isArray(value) && value.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-4 text-sm text-[#7F93B7]">
        {formatKey(key)}
      </div>
    );
  }

  if (isTableArray(value)) {
    const sample = value[0];
    const columns = Object.keys(sample).map((columnKey) => ({
      key: columnKey,
      label: formatKey(columnKey),
    }));

    const rows = value.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([columnKey, columnValue]) => [
          columnKey,
          typeof columnValue === "number" ? String(columnValue) : String(columnValue ?? "-"),
        ]),
      ),
    );

    return <DataTable title={formatKey(key)} columns={columns} rows={rows} />;
  }

  if (isRecord(value)) {
    return renderSummaryObject(value);
  }

  return null;
}

export function DashboardPage() {
  const [bundle, setBundle] = useState<DashboardBundle | null>(null);
  const [filterMetadata, setFilterMetadata] = useState<DashboardFilterMetadata | null>(null);
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<DashboardFilters>({
    defaultValues: {
      date_from: "",
      date_to: "",
      vehicle_id: "",
      driver_id: "",
      trip_id: "",
      region: "",
      fuel_type: "",
    },
  });

  const load = async (filters: DashboardFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardBundle, metadata] = await Promise.all([
        fetchRoleDashboard(role, filters),
        filterMetadata ? Promise.resolve(filterMetadata) : fetchDashboardFilterMetadata(),
      ]);
      setBundle(dashboardBundle);
      setFilterMetadata(metadata);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [role]);

  const filterFields: Array<keyof DashboardFilters> = [
    "date_from",
    "date_to",
    "vehicle_id",
    "driver_id",
    "trip_id",
    "region",
    "fuel_type",
  ];

  return (
    <DashboardShell>
      <section className="rounded-[28px] border border-white/8 bg-[#0D1526] p-5 md:p-6">
        <form onSubmit={handleSubmit((values) => void load(values))} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F93B7]">{formatKey("role")}</span>
            <select value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 text-sm text-[#F0F4FF] outline-none">
              {["admin", "fleet_manager", "dispatcher", "driver"].map((dashboardRole) => (
                <option key={dashboardRole} value={dashboardRole}>
                  {formatKey(dashboardRole)}
                </option>
              ))}
            </select>
          </label>
          {filterFields.map((field) => {
            if (field === "date_from" || field === "date_to") {
              return (
                <label key={field} className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F93B7]">{formatKey(field)}</span>
                  <input {...register(field)} type="date" className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 text-sm text-[#F0F4FF] outline-none" />
                </label>
              );
            }

            if (field === "vehicle_id") {
              return (
                <label key={field} className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F93B7]">{formatKey(field)}</span>
                  <select {...register(field)} className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 text-sm text-[#F0F4FF] outline-none">
                    <option value=""></option>
                    {filterMetadata?.vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.registration_number} - {vehicle.vehicle_name}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            if (field === "driver_id") {
              return (
                <label key={field} className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F93B7]">{formatKey(field)}</span>
                  <select {...register(field)} className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 text-sm text-[#F0F4FF] outline-none">
                    <option value=""></option>
                    {filterMetadata?.drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.full_name}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            if (field === "trip_id") {
              return (
                <label key={field} className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F93B7]">{formatKey(field)}</span>
                  <select {...register(field)} className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 text-sm text-[#F0F4FF] outline-none">
                    <option value=""></option>
                    {filterMetadata?.trips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.origin} {trip.destination}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            if (field === "region") {
              return (
                <label key={field} className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F93B7]">{formatKey(field)}</span>
                  <select {...register(field)} className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 text-sm text-[#F0F4FF] outline-none">
                    <option value=""></option>
                    {filterMetadata?.regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            return (
              <label key={field} className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7F93B7]">{formatKey(field)}</span>
                <select {...register(field)} className="w-full rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 text-sm text-[#F0F4FF] outline-none">
                  <option value=""></option>
                  {filterMetadata?.fuel_types.map((fuelType) => (
                    <option key={fuelType} value={fuelType}>
                      {fuelType}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
          <button type="submit" className="btn-primary min-h-[48px] justify-center xl:self-end">
            {formatKey("apply")}
          </button>
        </form>
      </section>

      {loading ? <LoadingDashboard /> : null}

      {error ? (
        <section className="rounded-[28px] border border-red-500/20 bg-[#0D1526] p-8 text-center text-[#F0F4FF]">
          <div className="text-sm text-[#C7D2E6]">{error}</div>
        </section>
      ) : null}

      {!loading && !error && bundle
        ? Object.entries(bundle).map(([sectionKey, sectionValue]) => {
            const widgets = isRecord(sectionValue)
              ? Object.entries(sectionValue)
                  .map(([widgetKey, widgetValue]) => ({
                    key: widgetKey,
                    node: renderWidget(widgetKey, widgetValue),
                  }))
                  .filter((item) => item.node)
              : [];

            return (
              <DashboardSection key={sectionKey} title={formatKey(sectionKey)}>
                <div className="grid gap-6 lg:grid-cols-2">
                  {widgets.map((widget) => (
                    <div key={widget.key} className={widget.key === "kpis" ? "lg:col-span-2" : ""}>
                      {widget.node}
                    </div>
                  ))}
                </div>
              </DashboardSection>
            );
          })
        : null}
    </DashboardShell>
  );
}
