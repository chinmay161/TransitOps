"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { expenseService } from "@/lib/expense.service";
import { ExpenseRecord } from "@/types/expense";
import { ModuleShell } from "@/components/app/ModuleShell";
import { Spinner } from "@phosphor-icons/react";

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [expense, setExpense] = useState<ExpenseRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expenseService
      .getById(id)
      .then((data) => {
        setExpense(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || "Failed to load expense details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <ModuleShell title="Expense Details">
        <div className="flex items-center justify-center p-12 text-[#6B7FA3]">
          <Spinner size={32} className="animate-spin text-[#F5A623]" />
        </div>
      </ModuleShell>
    );
  }

  if (error || !expense) {
    return (
      <ModuleShell title="Expense Details">
        <div className="rounded-[28px] border border-white/8 bg-[#0D1526] p-6 text-red-400">
          {error || "Expense not found"}
        </div>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      title="Expense Details"
      actions={
        <Link href={`/expenses/${id}/edit`} className="btn-primary">
          Edit Expense
        </Link>
      }
    >
      <section className="grid gap-4 rounded-[28px] border border-white/8 bg-[#0D1526] p-6 md:grid-cols-2">
        {Object.entries(expense).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-[#7F93B7]">{key.replace(/_/g, " ")}</div>
            <div className="mt-2 text-sm text-[#F0F4FF]">{String(value ?? "-")}</div>
          </div>
        ))}
      </section>
    </ModuleShell>
  );
}
