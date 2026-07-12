"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, MapPin, SpinnerGap } from "@phosphor-icons/react";
import { fuelLogService } from "@/lib/fuelLog.service";
import { FuelLog, FuelLogFormValues, FuelLogMetadata } from "@/types/fuel-log";
import { FuelLogShell } from "./FuelLogShell";
import { useToast } from "./ToastProvider";

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultValues(): FuelLogFormValues {
  return {
    vehicle_id: "",
    driver_id: "",
    trip_id: "",
    fuel_station_name: "",
    fuel_station_address: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
    fuel_type: "diesel",
    quantity: 0,
    unit: "liters",
    price_per_unit: 0,
    total_cost: 0,
    currency: "INR",
    odometer: 0,
    payment_method: "cash",
    receipt_number: "",
    receipt_image: "",
    remarks: "",
    filled_at: toDatetimeLocal(new Date().toISOString()),
    total_cost_override: false,
  };
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read receipt image."));
    reader.readAsDataURL(file);
  });
}

export function FuelLogFormPage({ mode, fuelLogId }: { mode: "create" | "edit"; fuelLogId?: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [metadata, setMetadata] = useState<FuelLogMetadata | null>(null);
  const [initialLog, setInitialLog] = useState<FuelLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stationSearch, setStationSearch] = useState("");
  const [stationMode, setStationMode] = useState<"search" | "manual">("search");
  const [priceStatus, setPriceStatus] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FuelLogFormValues>({ defaultValues: defaultValues() });

  const selectedVehicleId = watch("vehicle_id");
  const selectedDriverId = watch("driver_id");
  const quantity = watch("quantity");
  const pricePerUnit = watch("price_per_unit");
  const totalCostOverride = watch("total_cost_override");
  const selectedFuelType = watch("fuel_type");

  useEffect(() => {
    async function load() {
      try {
        const [metadataResult, logResult] = await Promise.all([
          fuelLogService.getMetadata(),
          mode === "edit" && fuelLogId ? fuelLogService.getById(fuelLogId) : Promise.resolve(null),
        ]);

        setMetadata(metadataResult);
        if (logResult) {
          setInitialLog(logResult);
          setValue("vehicle_id", logResult.vehicle_id);
          setValue("driver_id", logResult.driver_id);
          setValue("trip_id", logResult.trip_id || "");
          setValue("fuel_station_name", logResult.fuel_station_name);
          setValue("fuel_station_address", logResult.fuel_station_address || "");
          setValue("city", logResult.city || "");
          setValue("state", logResult.state || "");
          setValue("latitude", logResult.latitude !== null ? String(logResult.latitude) : "");
          setValue("longitude", logResult.longitude !== null ? String(logResult.longitude) : "");
          setValue("fuel_type", logResult.fuel_type);
          setValue("quantity", logResult.quantity);
          setValue("unit", logResult.unit);
          setValue("price_per_unit", logResult.price_per_unit);
          setValue("total_cost", logResult.total_cost);
          setValue("currency", logResult.currency);
          setValue("odometer", logResult.odometer);
          setValue("payment_method", logResult.payment_method);
          setValue("receipt_number", logResult.receipt_number || "");
          setValue("receipt_image", logResult.receipt_image || "");
          setValue("remarks", logResult.remarks || "");
          setValue("filled_at", toDatetimeLocal(logResult.filled_at));
        }
      } catch (error) {
        pushToast(error instanceof Error ? error.message : "Unable to load fuel log form.", "error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [fuelLogId, mode, pushToast, setValue]);

  useEffect(() => {
    if (!totalCostOverride) {
      setValue("total_cost", Number((Number(quantity || 0) * Number(pricePerUnit || 0)).toFixed(2)));
    }
  }, [pricePerUnit, quantity, setValue, totalCostOverride]);

  useEffect(() => {
    const vehicle = metadata?.vehicles.find((item) => item.id === selectedVehicleId);
    if (vehicle && mode === "create") {
      setValue("odometer", vehicle.current_odometer);
      setValue("fuel_type", vehicle.fuel_type);
    }
  }, [metadata?.vehicles, mode, selectedVehicleId, setValue]);

  const availableTrips = useMemo(() => {
    return (metadata?.trips || []).filter((trip) => {
      if (selectedVehicleId && trip.vehicle_id !== selectedVehicleId) return false;
      if (selectedDriverId && trip.driver_id !== selectedDriverId) return false;
      return true;
    });
  }, [metadata?.trips, selectedDriverId, selectedVehicleId]);

  const stationSuggestions = useMemo(() => {
    if (!stationSearch.trim()) {
      return metadata?.stations || [];
    }
    const query = stationSearch.toLowerCase();
    return (metadata?.stations || []).filter((station) =>
      [station.fuel_station_name, station.city, station.state]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [metadata?.stations, stationSearch]);

  const fetchSuggestedPrice = async () => {
    try {
      const fuel_station_name = watch("fuel_station_name");
      if (!fuel_station_name.trim()) {
        pushToast("Select or enter a fuel station first.", "error");
        return;
      }
      const result = await fuelLogService.getPriceSuggestion({
        fuel_station_name,
        city: watch("city"),
        state: watch("state"),
        fuel_type: selectedFuelType,
      });
      setPriceStatus(result.message);
      if (result.price !== null) {
        setValue("price_per_unit", result.price);
      }
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to fetch fuel price.", "error");
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      pushToast("Geolocation is not supported in this browser.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", String(position.coords.latitude));
        setValue("longitude", String(position.coords.longitude));
        pushToast("Current location captured.", "success");
      },
      () => {
        pushToast("Location permission was not granted.", "error");
      },
    );
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        trip_id: values.trip_id || "",
      };
      const result = mode === "edit" && fuelLogId ? await fuelLogService.update(fuelLogId, payload) : await fuelLogService.create(payload);
      pushToast(`Fuel log ${mode === "edit" ? "updated" : "created"} successfully.`, "success");
      router.push(`/fuel-log/${result.id}`);
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Unable to save fuel log.", "error");
    } finally {
      setSubmitting(false);
    }
  });

  if (loading) {
    return (
      <FuelLogShell
        title={mode === "edit" ? "Edit Fuel Log" : "Create Fuel Log"}
        subtitle="Preparing the fuel entry form and loading live vehicle, driver, trip, and station data."
      >
        <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
          <SpinnerGap size={32} className="animate-spin text-amber-500" />
        </div>
      </FuelLogShell>
    );
  }

  return (
    <FuelLogShell
      title={mode === "edit" ? "Edit Fuel Log" : "Create Fuel Log"}
      subtitle="Capture station details, auto-calculate cost, validate odometer progression, and keep the user in control if automatic fuel pricing is unavailable."
      actions={
        <>
          <Link href={mode === "edit" && initialLog ? `/fuel-log/${initialLog.id}` : "/fuel-log"} className="btn-secondary">
            <ArrowLeft size={18} />
            Back
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-6">
        <section className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">Fuel Entry Form</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-600">
                <span>Vehicle</span>
                <select
                  {...register("vehicle_id", { required: "Vehicle is required." })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                >
                  <option value="">Select vehicle</option>
                  {metadata?.vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registration_number} - {vehicle.vehicle_name} - {vehicle.current_odometer} km - {vehicle.status}
                    </option>
                  ))}
                </select>
                {errors.vehicle_id ? <p className="text-xs text-rose-600">{errors.vehicle_id.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Driver</span>
                <select
                  {...register("driver_id", { required: "Driver is required." })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                >
                  <option value="">Select driver</option>
                  {metadata?.drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.driver_name} - {driver.license_number} - {driver.status}
                    </option>
                  ))}
                </select>
                {errors.driver_id ? <p className="text-xs text-rose-600">{errors.driver_id.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                <span>Trip (optional)</span>
                <select {...register("trip_id")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none">
                  <option value="">No trip selected</option>
                  {availableTrips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.origin} to {trip.destination} - {trip.status}
                    </option>
                  ))}
                </select>
              </label>

              <div className="md:col-span-2">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setStationMode("search")}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      stationMode === "search" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Search Fuel Station
                  </button>
                  <button
                    type="button"
                    onClick={() => setStationMode("manual")}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      stationMode === "manual" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Manual Entry
                  </button>
                </div>
              </div>

              {stationMode === "search" ? (
                <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3">
                    <input
                      value={stationSearch}
                      onChange={(event) => setStationSearch(event.target.value)}
                      placeholder="Search from previously used fuel stations"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
                    />
                    <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                      {stationSuggestions.length === 0 ? (
                        <p className="px-4 py-4 text-sm text-slate-500">No matching stations yet. Switch to manual entry to add a new one.</p>
                      ) : (
                        stationSuggestions.map((station) => (
                          <button
                            key={`${station.fuel_station_name}-${station.city}-${station.state}`}
                            type="button"
                            onClick={() => {
                              setValue("fuel_station_name", station.fuel_station_name);
                              setValue("fuel_station_address", station.fuel_station_address || "");
                              setValue("city", station.city || "");
                              setValue("state", station.state || "");
                              setValue("latitude", station.latitude !== null ? String(station.latitude) : "");
                              setValue("longitude", station.longitude !== null ? String(station.longitude) : "");
                              setStationSearch(station.fuel_station_name);
                            }}
                            className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-amber-50"
                          >
                            <div className="font-medium text-slate-900">{station.fuel_station_name}</div>
                            <div className="text-slate-500">{[station.city, station.state].filter(Boolean).join(", ")}</div>
                          </button>
                        ))
                      )}
                    </div>
                    <button type="button" onClick={useCurrentLocation} className="btn-secondary w-fit">
                      <MapPin size={18} />
                      Use Browser Geolocation
                    </button>
                  </div>
                </div>
              ) : null}

              <label className="space-y-2 text-sm text-slate-600">
                <span>Fuel Station Name</span>
                <input
                  {...register("fuel_station_name", { required: "Fuel station name is required." })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                />
                {errors.fuel_station_name ? <p className="text-xs text-rose-600">{errors.fuel_station_name.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Fuel Station Address</span>
                <input {...register("fuel_station_address")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none" />
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>City</span>
                <input {...register("city")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none" />
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>State</span>
                <input {...register("state")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none" />
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Latitude</span>
                <input {...register("latitude")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none" />
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Longitude</span>
                <input {...register("longitude")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none" />
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Fuel Type</span>
                <select {...register("fuel_type")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none">
                  {metadata?.fuel_types.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Unit</span>
                <select {...register("unit")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none">
                  {metadata?.units.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Quantity</span>
                <input
                  type="number"
                  step="0.01"
                  {...register("quantity", {
                    required: "Quantity is required.",
                    min: { value: 0.01, message: "Quantity must be greater than 0." },
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                />
                {errors.quantity ? <p className="text-xs text-rose-600">{errors.quantity.message}</p> : null}
              </label>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Price Per Unit</span>
                  <button type="button" onClick={() => void fetchSuggestedPrice()} className="text-xs font-semibold text-amber-700">
                    Fetch suggested price
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  {...register("price_per_unit", {
                    required: "Price per unit is required.",
                    min: { value: 0.01, message: "Price per unit must be greater than 0." },
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                />
                {priceStatus ? <p className="text-xs text-slate-500">{priceStatus}</p> : null}
                {errors.price_per_unit ? <p className="text-xs text-rose-600">{errors.price_per_unit.message}</p> : null}
              </div>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Total Cost</span>
                <input
                  type="number"
                  step="0.01"
                  {...register("total_cost", {
                    required: "Total cost is required.",
                    min: { value: 0.01, message: "Total cost must be greater than 0." },
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                />
                {errors.total_cost ? <p className="text-xs text-rose-600">{errors.total_cost.message}</p> : null}
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:col-span-2">
                <input type="checkbox" {...register("total_cost_override")} className="size-4" />
                Allow manual total cost override
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Currency</span>
                <select {...register("currency")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none">
                  {metadata?.currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Payment Method</span>
                <select {...register("payment_method")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none">
                  {metadata?.payment_methods.map((method) => (
                    <option key={method} value={method}>
                      {method.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Odometer</span>
                <input
                  type="number"
                  step="0.01"
                  {...register("odometer", {
                    required: "Odometer is required.",
                    min: { value: 0, message: "Odometer must be a valid non-negative value." },
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                />
                {errors.odometer ? <p className="text-xs text-rose-600">{errors.odometer.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Filled At</span>
                <input
                  type="datetime-local"
                  {...register("filled_at", { required: "Filled date is required." })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                />
                {errors.filled_at ? <p className="text-xs text-rose-600">{errors.filled_at.message}</p> : null}
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Receipt Number</span>
                <input {...register("receipt_number")} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none" />
              </label>

              <label className="space-y-2 text-sm text-slate-600">
                <span>Receipt Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void fileToDataUrl(file)
                      .then((result) => setValue("receipt_image", result))
                      .catch((error: Error) => pushToast(error.message, "error"));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
                <span>Remarks</span>
                <textarea
                  {...register("remarks")}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
                />
              </label>
            </div>
          </div>

          <aside className="grid gap-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">Live Summary</h2>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Auto Total</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {Number(quantity || 0) * Number(pricePerUnit || 0) || 0} INR
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Selected Vehicle</div>
                  <div className="mt-2 font-medium text-slate-900">
                    {metadata?.vehicles.find((item) => item.id === selectedVehicleId)?.registration_number || "Not selected"}
                  </div>
                  <div className="text-slate-500">
                    Current odometer: {metadata?.vehicles.find((item) => item.id === selectedVehicleId)?.current_odometer ?? "-"}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Selected Driver</div>
                  <div className="mt-2 font-medium text-slate-900">
                    {metadata?.drivers.find((item) => item.id === selectedDriverId)?.driver_name || "Not selected"}
                  </div>
                  <div className="text-slate-500">
                    Status: {metadata?.drivers.find((item) => item.id === selectedDriverId)?.status || "-"}
                  </div>
                </div>
                {watch("receipt_image") ? (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Receipt Preview</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={watch("receipt_image")} alt="Receipt preview" className="mt-3 max-h-64 w-full rounded-2xl object-cover" />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Submission</h2>
              <p className="mt-2 text-sm text-slate-600">
                The backend validates active vehicle and driver status, optional trip compatibility, positive values, valid dates, and odometer progression before saving.
              </p>
              <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? <SpinnerGap size={18} className="animate-spin" /> : null}
                {mode === "edit" ? "Update Fuel Log" : "Create Fuel Log"}
              </button>
            </div>
          </aside>
        </section>
      </form>
    </FuelLogShell>
  );
}
