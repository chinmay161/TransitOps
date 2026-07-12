"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { expenseService } from "@/lib/expense.service";
import { ExpenseMetadata, ExpenseRecord } from "@/types/expense";
import { ModuleShell } from "@/components/app/ModuleShell";

function currency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

export default function ExpensesPage() {
  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [approvals, setApprovals] = useState<ExpenseRecord[]>([]);
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
  const [metadata, setMetadata] = useState<ExpenseMetadata | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  useEffect(() => {
    void expenseService.getMetadata().then(setMetadata).catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    void Promise.all([
      expenseService.list(query),
      expenseService.listApprovals(query),
      expenseService.getSummary(query),
    ])
      .then(([items, approvalItems, summaryData]) => {
        setRecords(items);
        setApprovals(approvalItems);
        setSummary(summaryData.summary);
      })
      .catch((err: Error) => setError(err.message));
  }, [query]);

  const refresh = () => {
    void Promise.all([
      expenseService.list(query),
      expenseService.listApprovals(query),
      expenseService.getSummary(query),
    ]).then(([items, approvalItems, summaryData]) => {
      setRecords(items);
      setApprovals(approvalItems);
      setSummary(summaryData.summary);
    });
  };

  return (
    <ModuleShell
      title="Expense Management"
      actions={
        <Link href="/expenses/new" className="btn-primary">
          Create Expense
        </Link>
      }
    >
      <section className="rounded-[28px] border border-white/8 bg-[#0D1526] p-6">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <select onChange={(e) => setFilters((current) => ({ ...current, vehicle_id: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            <option value="">All vehicles</option>
            {metadata?.vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.registration_number}
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
          <select onChange={(e) => setFilters((current) => ({ ...current, driver_id: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            <option value="">All drivers</option>
            {metadata?.drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.full_name}
              </option>
            ))}
          </select>
          <input placeholder="Vendor" onChange={(e) => setFilters((current) => ({ ...current, vendor: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <select onChange={(e) => setFilters((current) => ({ ...current, payment_method: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            <option value="">All payment methods</option>
            {metadata?.payment_methods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          <select onChange={(e) => setFilters((current) => ({ ...current, expense_status: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            <option value="">All statuses</option>
            {metadata?.statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <input placeholder="Search vehicle, driver, vendor, invoice, receipt" onChange={(e) => setFilters((current) => ({ ...current, q: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input type="date" onChange={(e) => setFilters((current) => ({ ...current, date_from: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input type="date" onChange={(e) => setFilters((current) => ({ ...current, date_to: e.target.value }))} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Total", summary?.total_amount],
          ["Pending", summary?.pending_amount],
          ["Approved", summary?.approved_amount],
          ["Paid", summary?.paid_amount],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-[8px] border border-white/8 bg-[#0D1526] p-5">
            <div className="text-xs uppercase tracking-[0.14em] text-[#7F93B7]">{label}</div>
            <div className="mt-2 text-2xl font-black">{currency(Number(value || 0))}</div>
          </div>
        ))}
      </section>

      <section className="rounded-[8px] border border-white/8 bg-[#0D1526] p-6">
        <h2 className="mb-4 text-xl font-bold">Approval Queue</h2>
        <div className="grid gap-3">
          {approvals.slice(0, 6).map((record) => (
            <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3">
              <div>
                <div className="font-semibold">{record.registration_number} / {record.vendor_name || record.vendor || record.category}</div>
                <div className="text-sm text-[#7F93B7]">{currency(record.total_amount)} / {record.expense_date}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => void expenseService.updateStatus(record.id, { expense_status: "rejected", remarks: "Rejected from approval screen" }).then(refresh)}>Reject</button>
                <button className="btn-primary" onClick={() => {
                  const approver = metadata?.approvers[0]?.id;
                  if (approver) void expenseService.updateStatus(record.id, { expense_status: "approved", approved_by: approver }).then(refresh);
                }}>Approve</button>
              </div>
            </div>
          ))}
          {approvals.length === 0 ? <div className="text-sm text-[#7F93B7]">No pending approvals.</div> : null}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/8 bg-[#0D1526] p-6">
        {error ? <div className="text-red-300">{error}</div> : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-[#7F93B7]">
                {["Vehicle", "Category", "Net Amount", "Vendor", "Payment Method", "Status", "Expense Date", "Invoice", "Receipt", "Actions"].map((heading) => (
                  <th key={heading} className="px-3 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-white/5">
                  <td className="px-3 py-3">{record.registration_number}</td>
                  <td className="px-3 py-3">{record.category}</td>
                  <td className="px-3 py-3">{currency(record.total_amount)}</td>
                  <td className="px-3 py-3">{record.vendor_name || record.vendor || "-"}</td>
                  <td className="px-3 py-3">{record.payment_method || "-"}</td>
                  <td className="px-3 py-3">{record.expense_status}</td>
                  <td className="px-3 py-3">{record.expense_date}</td>
                  <td className="px-3 py-3">{record.invoice_number || "-"}</td>
                  <td className="px-3 py-3">{record.receipt_number || "-"}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Link href={`/expenses/${record.id}`} className="btn-secondary">
                        View
                      </Link>
                      <Link href={`/expenses/${record.id}/edit`} className="btn-secondary">
                        Edit
                      </Link>
                      <button className="btn-secondary" onClick={() => void expenseService.remove(record.id).then(refresh)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ModuleShell>
  );
}
