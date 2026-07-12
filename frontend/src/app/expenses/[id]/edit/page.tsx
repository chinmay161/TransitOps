"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ModuleShell } from "@/components/app/ModuleShell";
import { expenseService } from "@/lib/expense.service";
import { ExpenseMetadata, ExpenseRecord, ExpenseUpsertInput } from "@/types/expense";

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [metadata, setMetadata] = useState<ExpenseMetadata | null>(null);
  const [expense, setExpense] = useState<ExpenseRecord | null>(null);
  const { register, handleSubmit, reset } = useForm<ExpenseUpsertInput>();

  useEffect(() => {
    void Promise.all([expenseService.getMetadata(), params.then(({ id }) => expenseService.getById(id))]).then(([meta, record]) => {
      setMetadata(meta);
      setExpense(record);
      reset({
        vehicle_id: record.vehicle_id,
        driver_id: record.driver_id || "",
        trip_id: record.trip_id || "",
        category: record.category,
        amount: record.amount,
        tax: record.tax,
        discount: record.discount,
        total_amount: record.total_amount,
        description: record.description || "",
        vendor_name: record.vendor_name || record.vendor || "",
        vendor_contact: record.vendor_contact || "",
        vendor_gst: record.vendor_gst || "",
        invoice_number: record.invoice_number || "",
        receipt_number: record.receipt_number || "",
        receipt_image: record.receipt_image || "",
        vendor: record.vendor || "",
        payment_method: record.payment_method || "",
        expense_status: record.expense_status,
        approved_by: record.approved_by || "",
        remarks: record.remarks || "",
        expense_date: record.expense_date.slice(0, 10),
      });
    });
  }, [params, reset]);

  return (
    <ModuleShell title="Edit Expense">
      <section className="rounded-[28px] border border-white/8 bg-[#0D1526] p-6">
        <form
          onSubmit={handleSubmit(async (values) => {
            if (!expense) return;
            await expenseService.update(expense.id, values);
            router.push(`/expenses/${expense.id}`);
          })}
          className="grid gap-4 md:grid-cols-2"
        >
          <select {...register("vehicle_id")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            {metadata?.vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.registration_number} - {vehicle.vehicle_name}
              </option>
            ))}
          </select>
          <select {...register("driver_id")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            <option value="">Select driver</option>
            {metadata?.drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.full_name}
              </option>
            ))}
          </select>
          <select {...register("trip_id")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            <option value="">Select trip</option>
            {metadata?.trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.origin} to {trip.destination}
              </option>
            ))}
          </select>
          <select {...register("category")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            {metadata?.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} placeholder="Amount" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input type="number" step="0.01" {...register("tax", { valueAsNumber: true })} placeholder="Tax" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input type="number" step="0.01" {...register("discount", { valueAsNumber: true })} placeholder="Discount" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("vendor_name")} placeholder="Vendor Name" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("vendor_contact")} placeholder="Vendor Contact" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("vendor_gst")} placeholder="Vendor GST" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("invoice_number")} placeholder="Invoice Number" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("receipt_number")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <select {...register("payment_method")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            <option value="">Select payment method</option>
            {metadata?.payment_methods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          <input type="date" {...register("expense_date")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <select {...register("expense_status")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            {metadata?.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input {...register("receipt_image")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 md:col-span-2" />
          <textarea {...register("description")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 md:col-span-2" rows={4} />
          <textarea {...register("remarks")} placeholder="Remarks" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 md:col-span-2" rows={3} />
          <button type="submit" className="btn-primary md:col-span-2">
            Update Expense
          </button>
        </form>
      </section>
    </ModuleShell>
  );
}
