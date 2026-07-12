import { Pool } from "pg";
import { ApiError } from "../utils/api";
import {
  FuelLogListParams,
  FuelLogPayload,
  FuelLogRecord,
  fuelTypes,
  fuelUnits,
  paymentMethods,
} from "../types/fuelLog";
import { fuelPriceService } from "./fuelPriceService";

type QueryValue = string | number | null;

function normalizeNullableText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toPositiveNumber(value: unknown, field: string) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new ApiError(422, `${field} must be greater than 0.`);
  }
  return number;
}

function toNonNegativeNumber(value: unknown, field: string) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new ApiError(422, `${field} must be a valid non-negative number.`);
  }
  return number;
}

function ensureDate(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new ApiError(422, "filled_at must be a valid date.");
  }
  return new Date(timestamp).toISOString();
}

function validateMembership<T extends readonly string[]>(
  value: string,
  allowed: T,
  field: string,
): T[number] {
  const normalized = value.toLowerCase();
  if (!allowed.includes(normalized)) {
    throw new ApiError(422, `${field} must be one of: ${allowed.join(", ")}.`);
  }
  return normalized as T[number];
}

function buildListQuery(params: FuelLogListParams) {
  const where: string[] = [];
  const values: QueryValue[] = [];

  const push = (clause: string, value: QueryValue) => {
    values.push(value);
    where.push(clause.replace("?", `$${values.length}`));
  };

  if (params.vehicle_id) push("fl.vehicle_id = ?", params.vehicle_id);
  if (params.driver_id) push("fl.driver_id = ?", params.driver_id);
  if (params.trip_id) push("fl.trip_id = ?", params.trip_id);
  if (params.fuel_type) push("fl.fuel_type = ?", params.fuel_type);
  if (params.city) push("LOWER(fl.city) = LOWER(?)", params.city);
  if (params.state) push("LOWER(fl.state) = LOWER(?)", params.state);
  if (params.date_from) push("fl.filled_at >= ?", params.date_from);
  if (params.date_to) push("fl.filled_at <= ?", params.date_to);
  if (params.q) {
    values.push(`%${params.q.trim()}%`);
    where.push(`(
      v.registration_number ILIKE $${values.length}
      OR CONCAT(v.make, ' ', v.model) ILIKE $${values.length}
      OR u.full_name ILIKE $${values.length}
      OR fl.fuel_station_name ILIKE $${values.length}
      OR COALESCE(fl.receipt_number, '') ILIKE $${values.length}
    )`);
  }

  const sortMap: Record<string, string> = {
    newest: "fl.filled_at DESC",
    oldest: "fl.filled_at ASC",
    cost: "fl.total_cost DESC, fl.filled_at DESC",
    vehicle: "v.registration_number ASC, fl.filled_at DESC",
    driver: "u.full_name ASC, fl.filled_at DESC",
  };

  const orderBy = sortMap[params.sort || "newest"] || sortMap.newest;
  const offset = (params.page - 1) * params.per_page;

  return {
    whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    values,
    orderBy,
    limit: params.per_page,
    offset,
  };
}

export class FuelLogService {
  constructor(private readonly pool: Pool) {}

  private mapPayload(payload: FuelLogPayload) {
    if (!payload.vehicle_id?.trim()) {
      throw new ApiError(422, "vehicle_id is required.");
    }
    if (!payload.driver_id?.trim()) {
      throw new ApiError(422, "driver_id is required.");
    }
    if (!payload.fuel_station_name?.trim()) {
      throw new ApiError(422, "fuel_station_name is required.");
    }
    if (!payload.currency?.trim()) {
      throw new ApiError(422, "currency is required.");
    }

    const fuel_type = validateMembership(payload.fuel_type, fuelTypes, "fuel_type");
    const unit = validateMembership(payload.unit, fuelUnits, "unit");
    const payment_method = validateMembership(payload.payment_method, paymentMethods, "payment_method");

    const quantity = toPositiveNumber(payload.quantity, "quantity");
    const price_per_unit = toPositiveNumber(payload.price_per_unit, "price_per_unit");
    const odometer = toNonNegativeNumber(payload.odometer, "odometer");
    const filled_at = ensureDate(payload.filled_at);
    const total_cost =
      payload.total_cost_override && payload.total_cost !== undefined && payload.total_cost !== null
        ? toPositiveNumber(payload.total_cost, "total_cost")
        : Number((quantity * price_per_unit).toFixed(2));

    return {
      vehicle_id: payload.vehicle_id.trim(),
      driver_id: payload.driver_id.trim(),
      trip_id: payload.trip_id || null,
      fuel_station_name: payload.fuel_station_name.trim(),
      fuel_station_address: normalizeNullableText(payload.fuel_station_address),
      city: normalizeNullableText(payload.city),
      state: normalizeNullableText(payload.state),
      latitude: payload.latitude === undefined || payload.latitude === null ? null : Number(payload.latitude),
      longitude: payload.longitude === undefined || payload.longitude === null ? null : Number(payload.longitude),
      fuel_type,
      quantity,
      unit,
      price_per_unit,
      total_cost,
      currency: payload.currency.trim().toUpperCase(),
      odometer,
      payment_method,
      receipt_number: normalizeNullableText(payload.receipt_number),
      receipt_image: normalizeNullableText(payload.receipt_image),
      remarks: normalizeNullableText(payload.remarks),
      filled_at,
    };
  }

  private async validateRelations(
    client: Pool,
    payload: ReturnType<FuelLogService["mapPayload"]>,
    currentId?: string,
  ) {
    const vehicleResult = await client.query(
      `SELECT id, status, current_odometer
       FROM vehicles
       WHERE id = $1`,
      [payload.vehicle_id],
    );

    if (!vehicleResult.rowCount) {
      throw new ApiError(404, "Selected vehicle does not exist.");
    }

    const vehicle = vehicleResult.rows[0];
    if (vehicle.status === "inactive") {
      throw new ApiError(422, "Selected vehicle is not active.");
    }

    const driverResult = await client.query(
      `SELECT id, status
       FROM drivers
       WHERE id = $1`,
      [payload.driver_id],
    );

    if (!driverResult.rowCount) {
      throw new ApiError(404, "Selected driver does not exist.");
    }

    const driver = driverResult.rows[0];
    if (driver.status === "inactive") {
      throw new ApiError(422, "Selected driver is not active.");
    }

    if (payload.trip_id) {
      const tripResult = await client.query(
        `SELECT id, vehicle_id, driver_id, status
         FROM trips
         WHERE id = $1`,
        [payload.trip_id],
      );

      if (!tripResult.rowCount) {
        throw new ApiError(404, "Selected trip does not exist.");
      }

      const trip = tripResult.rows[0];
      if (trip.vehicle_id !== payload.vehicle_id) {
        throw new ApiError(422, "Selected trip does not belong to the selected vehicle.");
      }
      if (trip.driver_id !== payload.driver_id) {
        throw new ApiError(422, "Selected trip does not belong to the selected driver.");
      }
      if (!["scheduled", "in_progress"].includes(trip.status)) {
        throw new ApiError(422, "Selected trip is not active.");
      }
    }

    const odometerResult = await client.query(
      `SELECT MAX(odometer) AS last_odometer
       FROM fuel_logs
       WHERE vehicle_id = $1
         AND ($2::uuid IS NULL OR id <> $2::uuid)`,
      [payload.vehicle_id, currentId || null],
    );

    const lastFuelOdometer = Number(odometerResult.rows[0]?.last_odometer ?? 0);
    const minOdometer = Math.max(Number(vehicle.current_odometer ?? 0), lastFuelOdometer);

    if (payload.odometer < minOdometer) {
      throw new ApiError(422, `Odometer must be at least ${minOdometer}.`);
    }
  }

  private baseSelect() {
    return `SELECT
      fl.id,
      fl.vehicle_id,
      fl.driver_id,
      fl.trip_id,
      fl.fuel_station_name,
      fl.fuel_station_address,
      fl.city,
      fl.state,
      fl.latitude::float8 AS latitude,
      fl.longitude::float8 AS longitude,
      fl.fuel_type,
      fl.quantity::float8 AS quantity,
      fl.unit,
      fl.price_per_unit::float8 AS price_per_unit,
      fl.total_cost::float8 AS total_cost,
      fl.currency,
      fl.odometer::float8 AS odometer,
      fl.payment_method,
      fl.receipt_number,
      fl.receipt_image,
      fl.remarks,
      fl.filled_at,
      fl.created_at,
      fl.updated_at,
      v.registration_number AS vehicle_registration_number,
      CONCAT(v.make, ' ', v.model) AS vehicle_name,
      v.status AS vehicle_status,
      v.current_odometer::float8 AS vehicle_current_odometer,
      u.full_name AS driver_name,
      d.license_number AS driver_license_number,
      d.status AS driver_status,
      t.status AS trip_status,
      t.origin AS trip_origin,
      t.destination AS trip_destination
    FROM fuel_logs fl
    INNER JOIN vehicles v ON v.id = fl.vehicle_id
    INNER JOIN drivers d ON d.id = fl.driver_id
    INNER JOIN users u ON u.id = d.user_id
    LEFT JOIN trips t ON t.id = fl.trip_id`;
  }

  async listFuelLogs(params: FuelLogListParams) {
    const safeParams: FuelLogListParams = {
      page: Math.max(1, Number(params.page) || 1),
      per_page: Math.min(50, Math.max(1, Number(params.per_page) || 10)),
      vehicle_id: params.vehicle_id,
      driver_id: params.driver_id,
      trip_id: params.trip_id,
      fuel_type: params.fuel_type,
      city: params.city,
      state: params.state,
      date_from: params.date_from,
      date_to: params.date_to,
      q: params.q,
      sort: params.sort,
    };

    const built = buildListQuery(safeParams);
    const listQuery = `${this.baseSelect()} ${built.whereSql} ORDER BY ${built.orderBy} LIMIT ${
      built.values.length + 1
    } OFFSET $${built.values.length + 2}`;
    const countQuery = `SELECT COUNT(*)::int AS total
      FROM fuel_logs fl
      INNER JOIN vehicles v ON v.id = fl.vehicle_id
      INNER JOIN drivers d ON d.id = fl.driver_id
      INNER JOIN users u ON u.id = d.user_id
      ${built.whereSql}`;

    const [listResult, countResult] = await Promise.all([
      this.pool.query<FuelLogRecord>(listQuery, [...built.values, built.limit, built.offset]),
      this.pool.query<{ total: number }>(countQuery, built.values),
    ]);

    const total = Number(countResult.rows[0]?.total || 0);
    return {
      items: listResult.rows,
      meta: {
        page: safeParams.page,
        per_page: safeParams.per_page,
        total,
        total_pages: Math.max(1, Math.ceil(total / safeParams.per_page)),
      },
    };
  }

  async getFuelLogById(id: string) {
    const result = await this.pool.query<FuelLogRecord>(`${this.baseSelect()} WHERE fl.id = $1`, [id]);
    if (!result.rowCount) {
      throw new ApiError(404, "Fuel log not found.");
    }
    return result.rows[0];
  }

  async createFuelLog(payload: FuelLogPayload) {
    const mapped = this.mapPayload(payload);
    await this.validateRelations(this.pool, mapped);

    const result = await this.pool.query<{ id: string }>(
      `INSERT INTO fuel_logs (
        vehicle_id,
        driver_id,
        trip_id,
        fuel_station_name,
        fuel_station_address,
        city,
        state,
        latitude,
        longitude,
        fuel_type,
        quantity,
        unit,
        price_per_unit,
        total_cost,
        currency,
        odometer,
        payment_method,
        receipt_number,
        receipt_image,
        remarks,
        filled_at,
        liters,
        cost_per_liter,
        odometer_km,
        notes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$11,$13,$16,$20
      )
      RETURNING id`,
      [
        mapped.vehicle_id,
        mapped.driver_id,
        mapped.trip_id,
        mapped.fuel_station_name,
        mapped.fuel_station_address,
        mapped.city,
        mapped.state,
        mapped.latitude,
        mapped.longitude,
        mapped.fuel_type,
        mapped.quantity,
        mapped.unit,
        mapped.price_per_unit,
        mapped.total_cost,
        mapped.currency,
        mapped.odometer,
        mapped.payment_method,
        mapped.receipt_number,
        mapped.receipt_image,
        mapped.remarks,
        mapped.filled_at,
      ],
    );

    await this.pool.query(
      `UPDATE vehicles
       SET current_odometer = GREATEST(current_odometer, $2),
           updated_at = now()
       WHERE id = $1`,
      [mapped.vehicle_id, mapped.odometer],
    );

    return this.getFuelLogById(result.rows[0].id);
  }

  async updateFuelLog(id: string, payload: FuelLogPayload) {
    await this.getFuelLogById(id);
    const mapped = this.mapPayload(payload);
    await this.validateRelations(this.pool, mapped, id);

    await this.pool.query(
      `UPDATE fuel_logs
       SET
         vehicle_id = $2,
         driver_id = $3,
         trip_id = $4,
         fuel_station_name = $5,
         fuel_station_address = $6,
         city = $7,
         state = $8,
         latitude = $9,
         longitude = $10,
         fuel_type = $11,
         quantity = $12,
         unit = $13,
         price_per_unit = $14,
         total_cost = $15,
         currency = $16,
         odometer = $17,
         payment_method = $18,
         receipt_number = $19,
         receipt_image = $20,
         remarks = $21,
         filled_at = $22,
         liters = $12,
         cost_per_liter = $14,
         odometer_km = $17,
         notes = $21,
         updated_at = now()
       WHERE id = $1`,
      [
        id,
        mapped.vehicle_id,
        mapped.driver_id,
        mapped.trip_id,
        mapped.fuel_station_name,
        mapped.fuel_station_address,
        mapped.city,
        mapped.state,
        mapped.latitude,
        mapped.longitude,
        mapped.fuel_type,
        mapped.quantity,
        mapped.unit,
        mapped.price_per_unit,
        mapped.total_cost,
        mapped.currency,
        mapped.odometer,
        mapped.payment_method,
        mapped.receipt_number,
        mapped.receipt_image,
        mapped.remarks,
        mapped.filled_at,
      ],
    );

    await this.pool.query(
      `UPDATE vehicles
       SET current_odometer = GREATEST(current_odometer, $2),
           updated_at = now()
       WHERE id = $1`,
      [mapped.vehicle_id, mapped.odometer],
    );

    return this.getFuelLogById(id);
  }

  async deleteFuelLog(id: string) {
    const result = await this.pool.query(`DELETE FROM fuel_logs WHERE id = $1 RETURNING id`, [id]);
    if (!result.rowCount) {
      throw new ApiError(404, "Fuel log not found.");
    }
    return { id };
  }

  async getMetadata(vehicleId?: string) {
    const [vehiclesResult, driversResult, tripsResult, stationsResult] = await Promise.all([
      this.pool.query(
        `SELECT
          id,
          registration_number,
          CONCAT(make, ' ', model) AS vehicle_name,
          fuel_type,
          current_odometer::float8 AS current_odometer,
          status
         FROM vehicles
         ORDER BY registration_number ASC`,
      ),
      this.pool.query(
        `SELECT
          d.id,
          u.full_name AS driver_name,
          d.license_number,
          d.status
         FROM drivers d
         INNER JOIN users u ON u.id = d.user_id
         ORDER BY u.full_name ASC`,
      ),
      this.pool.query(
        `SELECT
          id,
          vehicle_id,
          driver_id,
          status,
          origin,
          destination
         FROM trips
         WHERE status IN ('scheduled', 'in_progress')
           AND ($1::uuid IS NULL OR vehicle_id = $1::uuid)
         ORDER BY scheduled_start DESC`,
        [vehicleId || null],
      ),
      this.pool.query(
        `SELECT DISTINCT
          fuel_station_name,
          fuel_station_address,
          city,
          state,
          latitude::float8 AS latitude,
          longitude::float8 AS longitude
         FROM fuel_logs
         WHERE fuel_station_name IS NOT NULL
         ORDER BY fuel_station_name ASC
         LIMIT 20`,
      ),
    ]);

    return {
      vehicles: vehiclesResult.rows,
      drivers: driversResult.rows,
      trips: tripsResult.rows,
      stations: stationsResult.rows,
      fuel_types: fuelTypes,
      units: fuelUnits,
      payment_methods: paymentMethods,
      currencies: ["INR"],
    };
  }

  async getPriceSuggestion(payload: { fuel_station_name: string; city?: string | null; state?: string | null; fuel_type: string }) {
    if (!payload.fuel_station_name?.trim()) {
      throw new ApiError(422, "fuel_station_name is required.");
    }

    const fuel_type = validateMembership(payload.fuel_type, fuelTypes, "fuel_type");
    return fuelPriceService.getSuggestedPrice({
      fuel_station_name: payload.fuel_station_name.trim(),
      city: payload.city || null,
      state: payload.state || null,
      fuel_type,
    });
  }
}
