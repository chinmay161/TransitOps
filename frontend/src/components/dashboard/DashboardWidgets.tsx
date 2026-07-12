"use client";

import { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardDatum, DashboardMetric } from "@/types/dashboard";

const PIE_COLORS = ["#F5A623", "#10B981", "#3B82F6", "#A855F7", "#EF4444", "#64748B", "#14B8A6"];

export function formatKey(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function DashboardSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-[#0D1526] p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-[-0.03em] text-[#F0F4FF]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function MetricGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <article key={metric.id} className="rounded-[24px] border border-white/6 bg-white/[0.03] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7F93B7]">{metric.label || formatKey(metric.id)}</p>
          <p className="mt-3 text-2xl font-black text-[#F0F4FF]">{formatMetric(metric.value, metric.format)}</p>
        </article>
      ))}
    </div>
  );
}

function formatMetric(value: number, format: DashboardMetric["format"]) {
  if (format === "currency") {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
  }
  if (format === "percent") {
    return `${value.toFixed(2)}%`;
  }
  return new Intl.NumberFormat("en-IN").format(value);
}

export function StatTiles({
  items,
  valueFormat = "number",
}: {
  items: Array<{ label: string; value: number }>;
  valueFormat?: "number" | "currency" | "percent";
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-[22px] border border-white/6 bg-[#111E35]/55 p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7F93B7]">{item.label}</div>
          <div className="mt-3 text-xl font-black text-[#F0F4FF]">{formatMetric(item.value, valueFormat)}</div>
        </div>
      ))}
    </div>
  );
}

export function ChartCard({
  title,
  type,
  data,
  dataKey = "value",
}: {
  title: string;
  type: "line" | "bar" | "pie" | "area";
  data: DashboardDatum[];
  dataKey?: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-4">
      <div className="mb-4 text-sm font-semibold text-[#F0F4FF]">{title}</div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#7F93B7" tickLine={false} axisLine={false} />
              <YAxis stroke="#7F93B7" tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey={dataKey} stroke="#F5A623" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          ) : type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#7F93B7" tickLine={false} axisLine={false} />
              <YAxis stroke="#7F93B7" tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey={dataKey} fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : type === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#7F93B7" tickLine={false} axisLine={false} />
              <YAxis stroke="#7F93B7" tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey={dataKey} stroke="#10B981" fill="rgba(16,185,129,0.28)" strokeWidth={3} />
            </AreaChart>
          ) : (
            <PieChart>
              <Pie data={data} dataKey={dataKey} nameKey="label" outerRadius={96} innerRadius={56}>
                {data.map((entry, index) => (
                  <Cell key={`${entry.label}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SummaryCard({
  title,
  lines,
}: {
  title: string;
  lines: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-4">
      <div className="mb-4 text-sm font-semibold text-[#F0F4FF]">{title}</div>
      <div className="space-y-3">
        {lines.map((line) => (
          <div key={line.label} className="flex items-center justify-between gap-4 rounded-2xl bg-[#111E35]/45 px-4 py-3">
            <span className="text-sm text-[#9FB0CC]">{line.label}</span>
            <span className="text-sm font-bold text-[#F0F4FF]">{line.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DataTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, unknown>>;
}) {
  return (
    <div className="rounded-[24px] border border-white/6 bg-white/[0.03] p-4">
      <div className="mb-4 text-sm font-semibold text-[#F0F4FF]">{title}</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 text-[#7F93B7]">
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-3 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-white/5 last:border-b-0">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-3 text-[#F0F4FF]">
                    {String(row[column.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LoadingDashboard() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-[24px] border border-white/8 bg-white/[0.04]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-96 animate-pulse rounded-[28px] border border-white/8 bg-[#0D1526]" />
        ))}
      </div>
    </div>
  );
}
