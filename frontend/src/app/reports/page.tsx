"use client";

import { useEffect, useState } from "react";
import { expenseService } from "@/lib/expense.service";
import { deleteReportHistory, fetchReport, fetchReportHistory, getReportExportUrl, updateReportFavorite } from "@/lib/report.service";
import { ModuleShell } from "@/components/app/ModuleShell";
import { ChartCard, formatKey } from "@/components/dashboard/DashboardWidgets";
import { ExpenseMetadata } from "@/types/expense";
import { GeneratedReport, ReportHistoryRecord } from "@/types/report";

const reportTypes = ["fuel", "expense", "vehicle", "driver", "trip", "maintenance", "fleet_summary", "financial_summary"] as const;

export default function ReportsPage() {
  const [type, setType] = useState<(typeof reportTypes)[number]>("fuel");
  const [metadata, setMetadata] = useState<ExpenseMetadata | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [history, setHistory] = useState<ReportHistoryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void expenseService.getMetadata().then(setMetadata);
  }, []);

  useEffect(() => {
    void Promise.all([fetchReport(type, filters), fetchReportHistory()])
      .then(([nextReport, nextHistory]) => {
        setReport(nextReport);
        setHistory(nextHistory);
        setError(null);
      })
      .catch((err: Error) => setError(err.message));
  }, [type, filters]);

  const rows = report?.details || [];
  const columns = rows[0] ? Object.keys(rows[0]) : [];

  return (
    <ModuleShell title="Reports">
      <section className="grid gap-4 rounded-[8px] border border-white/8 bg-[#0D1526] p-6 md:grid-cols-4">
        <select value={type} onChange={(e) => setType(e.target.value as (typeof reportTypes)[number])} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
          {reportTypes.map((reportType) => (
            <option key={reportType} value={reportType}>
              {reportType}
            </option>
          ))}
        </select>
        <input type="date" onChange={(e) => setFilters((current) => ({ ...current, date_from: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
        <input type="date" onChange={(e) => setFilters((current) => ({ ...current, date_to: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
        <select onChange={(e) => setFilters((current) => ({ ...current, vehicle_id: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
          <option value="">All vehicles</option>
          {metadata?.vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.registration_number}
            </option>
          ))}
        </select>
        <select onChange={(e) => setFilters((current) => ({ ...current, driver_id: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
          <option value="">All drivers</option>
          {metadata?.drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.full_name}
            </option>
          ))}
        </select>
        <select onChange={(e) => setFilters((current) => ({ ...current, category: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
          <option value="">All categories</option>
          {metadata?.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select onChange={(e) => setFilters((current) => ({ ...current, payment_method: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
          <option value="">All payment methods</option>
          {metadata?.payment_methods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
        <input placeholder="Vendor" onChange={(e) => setFilters((current) => ({ ...current, vendor: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
        <input placeholder="City" onChange={(e) => setFilters((current) => ({ ...current, city: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
        <input placeholder="State" onChange={(e) => setFilters((current) => ({ ...current, state: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
      </section>

      {error ? <section className="rounded-[8px] border border-red-500/20 bg-[#0D1526] p-6 text-red-300">{error}</section> : null}

      <section className="grid gap-4 md:grid-cols-4">
        {Object.entries(report?.summary || {}).slice(0, 8).map(([key, value]) => (
          <div key={key} className="rounded-[8px] border border-white/8 bg-[#0D1526] p-5">
            <div className="text-xs uppercase tracking-[0.14em] text-[#7F93B7]">{formatKey(key)}</div>
            <div className="mt-2 text-2xl font-black">{String(value)}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {Object.entries(report?.analytics || {}).slice(0, 6).map(([key, value]) => (
          <ChartCard key={key} title={formatKey(key)} type={key.includes("trend") ? "line" : "bar"} data={value} />
        ))}
      </section>

      <section className="rounded-[8px] border border-white/8 bg-[#0D1526] p-6">
        <h2 className="mb-4 text-xl font-bold">Business Insights</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(report?.insights || {}).map(([key, value]) => (
            <div key={key} className="border-b border-white/8 pb-3">
              <div className="text-xs uppercase tracking-[0.14em] text-[#7F93B7]">{formatKey(key)}</div>
              <div className="mt-1 font-semibold">{String(value || "-")}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[8px] border border-white/8 bg-[#0D1526] p-6">
        <div className="mb-4 flex flex-wrap gap-3">
          <a href={getReportExportUrl(type, filters, "csv")} className="btn-secondary">
            Export CSV
          </a>
          <a href={getReportExportUrl(type, filters, "pdf")} className="btn-secondary">
            Export PDF
          </a>
          <button onClick={() => window.print()} className="btn-primary">
            Print
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[#7F93B7]">
                {columns.map((column) => (
                  <th key={column} className="px-3 py-3 font-medium">
                    {column.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b border-white/5">
                  {columns.map((column) => (
                    <td key={column} className="px-3 py-3">
                      {String(row[column] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[8px] border border-white/8 bg-[#0D1526] p-6">
        <h2 className="mb-4 text-xl font-bold">Report History</h2>
        <div className="grid gap-3">
          {history.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3 text-sm">
              <div>
                <div className="font-semibold">{item.report_name}</div>
                <div className="text-[#7F93B7]">{item.generated_at} / {item.format}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => void updateReportFavorite(item.id, !item.is_favorite).then(fetchReportHistory).then(setHistory)}>
                  {item.is_favorite ? "Unfavorite" : "Favorite"}
                </button>
                <button className="btn-secondary" onClick={() => void deleteReportHistory(item.id).then(fetchReportHistory).then(setHistory)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ModuleShell>
  );
}
