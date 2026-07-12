"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ModuleShell } from "@/components/app/ModuleShell";
import { expenseService } from "@/lib/expense.service";
import { ExpenseMetadata, ExpenseUpsertInput } from "@/types/expense";

export default function NewExpensePage() {
  const router = useRouter();
  const [metadata, setMetadata] = useState<ExpenseMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<ExpenseUpsertInput>({
    defaultValues: {
      vehicle_id: "",
      driver_id: "",
      trip_id: "",
      category: "fuel",
      amount: 0,
      tax: 0,
      discount: 0,
      total_amount: 0,
      description: "",
      vendor_name: "",
      vendor_contact: "",
      vendor_gst: "",
      invoice_number: "",
      receipt_number: "",
      receipt_image: "",
      vendor: "",
      payment_method: "cash",
      expense_status: "pending",
      approved_by: "",
      remarks: "",
      expense_date: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    void expenseService.getMetadata().then(setMetadata).catch((err: Error) => setError(err.message));
  }, []);

  return (
    <ModuleShell title="Create Expense">
      <section className="rounded-[28px] border border-white/8 bg-[#0D1526] p-6">
        {error ? <div className="mb-4 text-red-300">{error}</div> : null}
        <form
          onSubmit={handleSubmit(async (values) => {
            const result = await expenseService.create(values);
            router.push(`/expenses/${result.id}`);
          })}
          className="grid gap-4 md:grid-cols-2"
        >
          <select {...register("vehicle_id", { required: true })} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            <option value="">Select vehicle</option>
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
          <select {...register("category", { required: true })} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            {metadata?.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input type="number" step="0.01" {...register("amount", { valueAsNumber: true, required: true })} placeholder="Amount" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input type="number" step="0.01" {...register("tax", { valueAsNumber: true })} placeholder="Tax" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input type="number" step="0.01" {...register("discount", { valueAsNumber: true })} placeholder="Discount" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("vendor_name")} placeholder="Vendor Name" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("vendor_contact")} placeholder="Vendor Contact" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("vendor_gst")} placeholder="Vendor GST" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("invoice_number")} placeholder="Invoice Number" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <input {...register("receipt_number")} placeholder="Receipt Number" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <select {...register("payment_method")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            <option value="">Select payment method</option>
            {metadata?.payment_methods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          <input type="date" {...register("expense_date", { required: true })} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3" />
          <select {...register("expense_status")} className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3">
            {metadata?.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input {...register("receipt_image")} placeholder="Receipt Image URL or Data URL" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 md:col-span-2" />
          <textarea {...register("description")} placeholder="Description" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 md:col-span-2" rows={4} />
          <textarea {...register("remarks")} placeholder="Remarks" className="rounded-2xl border border-white/8 bg-[#070D1A] px-4 py-3 md:col-span-2" rows={3} />
          <button type="submit" className="btn-primary md:col-span-2">
            Save Expense
          </button>
        </form>
      </section>
    </ModuleShell>
  );
}
