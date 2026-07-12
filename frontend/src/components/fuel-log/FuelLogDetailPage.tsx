"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, PencilSimple, SpinnerGap, Trash } from "@phosphor-icons/react";
import { fuelLogService } from "@/lib/fuelLog.service";
import { FuelLog } from "@/types/fuel-log";
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
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export function FuelLogDetailPage({ fuelLogId }: { fuelLogId: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [log, setLog] = useState<FuelLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    void fuelLogService
      .getById(fuelLogId)
      .then(setLog)
      .catch((error: Error) => pushToast(error.message, "error"))
      .finally(() => setLoading(false));
  }, [fuelLogId, pushToast]);

  const handleDelete = async () => {
    try {
      await fuelLogService.remove(fuelLogId);
      pushToast("Fuel log deleted successfully.", "success");
      router.push("/fuel-log");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to delete fuel log.", "error");
    }
  };

  return (
    <FuelLogShell
      title="Fuel Log Details"
      subtitle="Review the complete station, vehicle, driver, trip, odometer, and receipt context for this fuel event."
      actions={
        <>
          <Link href="/fuel-log" className="btn-secondary">
            <ArrowLeft size={18} />
            Back to List
          </Link>
          <Link href={`/fuel-log/${fuelLogId}/edit`} className="btn-primary">
            <PencilSimple size={18} />
            Edit
          </Link>
        </>
      }
    >
      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
          <SpinnerGap size={32} className="animate-spin text-amber-500" />
        </div>
      ) : !log ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-600">Fuel log not found.</div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Station</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">{log.fuel_station_name}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {[log.fuel_station_address, log.city, log.state].filter(Boolean).join(", ") || "Manual location only"}
                </p>
              </div>
              <button onClick={() => setShowDelete(true)} className="btn-secondary text-rose-700">
                <Trash size={18} />
                Delete
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["Vehicle", `${log.vehicle_registration_number} - ${log.vehicle_name}`],
                ["Driver", `${log.driver_name} - ${log.driver_license_number}`],
                ["Trip", log.trip_id ? `${log.trip_origin} to ${log.trip_destination}` : "No trip linked"],
                ["Fuel Type", log.fuel_type],
                ["Quantity", `${log.quantity} ${log.unit}`],
                ["Price Per Unit", formatCurrency(log.price_per_unit, log.currency)],
                ["Total Cost", formatCurrency(log.total_cost, log.currency)],
                ["Payment Method", log.payment_method.replace("_", " ")],
                ["Odometer", `${log.odometer} km`],
                ["Filled At", formatDate(log.filled_at)],
                ["Receipt Number", log.receipt_number || "Not provided"],
                ["Coordinates", log.latitude !== null && log.longitude !== null ? `${log.latitude}, ${log.longitude}` : "Not captured"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
                  <div className="mt-2 font-medium capitalize text-slate-900">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Remarks</div>
              <p className="mt-2 text-sm text-slate-700">{log.remarks || "No remarks added."}</p>
            </div>
          </div>

          <aside className="grid gap-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Analytics Ready Snapshot</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Vehicle Status</div>
                  <div className="mt-2 font-medium text-slate-900">{log.vehicle_status}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Driver Status</div>
                  <div className="mt-2 font-medium text-slate-900">{log.driver_status}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Current Vehicle Odometer</div>
                  <div className="mt-2 font-medium text-slate-900">{log.vehicle_current_odometer} km</div>
                </div>
              </div>
            </div>

            {log.receipt_image ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Receipt Preview</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={log.receipt_image} alt="Receipt preview" className="mt-4 max-h-[420px] w-full rounded-3xl object-cover" />
              </div>
            ) : null}
          </aside>
        </section>
      )}

      {showDelete && log ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">Delete this record?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This action will permanently remove the fuel purchase recorded at {log.fuel_station_name}.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowDelete(false)}>
                Cancel
              </button>
              <button className="btn-primary !bg-rose-600 !text-white hover:!bg-rose-700" onClick={() => void handleDelete()}>
                Delete Fuel Log
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FuelLogShell>
  );
}
