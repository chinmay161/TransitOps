import Link from "next/link";
import { expenseService } from "@/lib/expense.service";
import { ModuleShell } from "@/components/app/ModuleShell";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expense = await expenseService.getById(id);

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
