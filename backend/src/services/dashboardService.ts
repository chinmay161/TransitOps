import { Pool } from "pg";
import { DashboardFilters, QueryPart } from "../types/dashboard";

function buildDateRangeClause(
  filters: DashboardFilters,
  column: string,
  values: Array<string | number>,
) {
  const clauses: string[] = [];

  if (filters.date_from) {
    values.push(filters.date_from);
    clauses.push(`${column} >= $${values.length}`);
  }

  if (filters.date_to) {
    values.push(filters.date_to);
    clauses.push(`${column} <= $${values.length}`);
  }

  return clauses;
}

function buildTripFilter(filters: DashboardFilters): QueryPart {
  const values: Array<string | number> = [];
  const clauses: string[] = [];

  clauses.push(...buildDateRangeClause(filters, "t.scheduled_start::date", values));

  if (filters.vehicle_id) {
    values.push(filters.vehicle_id);
    clauses.push(`t.vehicle_id = $${values.length}`);
  }
  if (filters.driver_id) {
    values.push(filters.driver_id);
    clauses.push(`t.driver_id = $${values.length}`);
  }
  if (filters.trip_id) {
    values.push(filters.trip_id);
    clauses.push(`t.id = $${values.length}`);
  }
  if (filters.region) {
    values.push(`%${filters.region}%`);
    clauses.push(`(t.origin ILIKE $${values.length} OR t.destination ILIKE $${values.length})`);
  }

  return {
    clause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
}

function buildFuelFilter(filters: DashboardFilters): QueryPart {
  const values: Array<string | number> = [];
  const clauses: string[] = [];

  clauses.push(...buildDateRangeClause(filters, "fl.filled_at::date", values));

  if (filters.vehicle_id) {
    values.push(filters.vehicle_id);
    clauses.push(`fl.vehicle_id = $${values.length}`);
  }
  if (filters.driver_id) {
    values.push(filters.driver_id);
    clauses.push(`fl.driver_id = $${values.length}`);
  }
  if (filters.trip_id) {
    values.push(filters.trip_id);
    clauses.push(`fl.trip_id = $${values.length}`);
  }
  if (filters.region) {
    values.push(`%${filters.region}%`);
    clauses.push(`(fl.city ILIKE $${values.length} OR fl.state ILIKE $${values.length})`);
  }
  if (filters.fuel_type) {
    values.push(filters.fuel_type);
    clauses.push(`fl.fuel_type = $${values.length}`);
  }

  return {
    clause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
}

function buildExpenseFilter(filters: DashboardFilters): QueryPart {
  const values: Array<string | number> = [];
  const clauses: string[] = [];

  clauses.push(...buildDateRangeClause(filters, "e.expense_date", values));

  if (filters.vehicle_id) {
    values.push(filters.vehicle_id);
    clauses.push(`e.vehicle_id = $${values.length}`);
  }
  if (filters.trip_id) {
    values.push(filters.trip_id);
    clauses.push(`e.trip_id = $${values.length}`);
  }

  return {
    clause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
}

function buildMaintenanceFilter(filters: DashboardFilters): QueryPart {
  const values: Array<string | number> = [];
  const clauses: string[] = [];

  clauses.push(...buildDateRangeClause(filters, "m.scheduled_date", values));

  if (filters.vehicle_id) {
    values.push(filters.vehicle_id);
    clauses.push(`m.vehicle_id = $${values.length}`);
  }

  return {
    clause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
}

function buildDriverFilter(filters: DashboardFilters): QueryPart {
  const values: Array<string | number> = [];
  const clauses: string[] = [];

  if (filters.driver_id) {
    values.push(filters.driver_id);
    clauses.push(`d.id = $${values.length}`);
  }

  return {
    clause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
}

function metric(id: string, value: number, format: "number" | "currency" | "percent" = "number") {
  return { id, value, format };
}

export class DashboardService {
  constructor(private readonly pool: Pool) {}

  async getRoleDashboard(role: string, filters: DashboardFilters) {
    const normalizedRole = role.toLowerCase();

    if (normalizedRole === "fleet_manager") {
      const [fleet, maintenance, fuel, expenses, finance, notifications] = await Promise.all([
        this.getFleet(filters),
        this.getMaintenance(filters),
        this.getFuel(filters),
        this.getExpenses(filters),
        this.getFinance(filters),
        this.getNotifications(filters),
      ]);
      return {
        role: normalizedRole,
        fleet_availability: fleet,
        vehicle_health: maintenance,
        fuel_analytics: fuel,
        expense_analytics: expenses,
        fleet_performance: finance,
        notifications,
      };
    }

    if (normalizedRole === "dispatcher") {
      const [availableVehicles, availableDrivers, activeTrips, pendingTrips, delayedTrips] = await Promise.all([
        this.pool.query(
          `SELECT id, registration_number, CONCAT(make, ' ', model) AS vehicle_name, fuel_type, current_odometer::float8 AS current_odometer
           FROM vehicles
           WHERE status = 'available'
           ORDER BY registration_number ASC`,
        ),
        this.pool.query(
          `SELECT d.id, u.full_name, d.license_number, d.status
           FROM drivers d
           INNER JOIN users u ON u.id = d.user_id
           WHERE d.status = 'available'
           ORDER BY u.full_name ASC`,
        ),
        this.pool.query(
          `SELECT t.id, v.registration_number, u.full_name AS driver_name, t.origin, t.destination, t.scheduled_start, t.scheduled_end
           FROM trips t
           INNER JOIN vehicles v ON v.id = t.vehicle_id
           INNER JOIN drivers d ON d.id = t.driver_id
           INNER JOIN users u ON u.id = d.user_id
           WHERE t.status = 'in_progress'
           ORDER BY t.scheduled_end ASC`,
        ),
        this.pool.query(
          `SELECT t.id, v.registration_number, u.full_name AS driver_name, t.origin, t.destination, t.scheduled_start, t.scheduled_end
           FROM trips t
           INNER JOIN vehicles v ON v.id = t.vehicle_id
           INNER JOIN drivers d ON d.id = t.driver_id
           INNER JOIN users u ON u.id = d.user_id
           WHERE t.status = 'scheduled'
           ORDER BY t.scheduled_start ASC`,
        ),
        this.pool.query(
          `SELECT t.id, v.registration_number, u.full_name AS driver_name, t.origin, t.destination, t.scheduled_end
           FROM trips t
           INNER JOIN vehicles v ON v.id = t.vehicle_id
           INNER JOIN drivers d ON d.id = t.driver_id
           INNER JOIN users u ON u.id = d.user_id
           WHERE (t.status = 'in_progress' AND t.scheduled_end < NOW())
              OR (t.status = 'completed' AND t.actual_end IS NOT NULL AND t.actual_end > t.scheduled_end)
           ORDER BY t.scheduled_end ASC`,
        ),
      ]);
      return {
        role: normalizedRole,
        available_vehicles: availableVehicles.rows,
        available_drivers: availableDrivers.rows,
        active_trips: activeTrips.rows,
        pending_trips: pendingTrips.rows,
        delayed_trips: delayedTrips.rows,
        vehicle_availability: availableVehicles.rows,
        driver_availability: availableDrivers.rows,
      };
    }

    if (normalizedRole === "driver") {
      const driverId = filters.driver_id || null;
      const [currentTrip, todayTrips, upcomingTrips, completedTrips, fuelLogs, notifications] = await Promise.all([
        this.pool.query(
          `SELECT id, origin, destination, scheduled_start, scheduled_end, status
           FROM trips
           WHERE ($1::uuid IS NULL OR driver_id = $1::uuid)
             AND status = 'in_progress'
           ORDER BY scheduled_start DESC
           LIMIT 1`,
          [driverId],
        ),
        this.pool.query(
          `SELECT id, origin, destination, scheduled_start, scheduled_end, status
           FROM trips
           WHERE ($1::uuid IS NULL OR driver_id = $1::uuid)
             AND scheduled_start::date = CURRENT_DATE
           ORDER BY scheduled_start ASC`,
          [driverId],
        ),
        this.pool.query(
          `SELECT id, origin, destination, scheduled_start, scheduled_end, status
           FROM trips
           WHERE ($1::uuid IS NULL OR driver_id = $1::uuid)
             AND scheduled_start > NOW()
             AND status = 'scheduled'
           ORDER BY scheduled_start ASC
           LIMIT 10`,
          [driverId],
        ),
        this.pool.query(
          `SELECT id, origin, destination, actual_start, actual_end, status
           FROM trips
           WHERE ($1::uuid IS NULL OR driver_id = $1::uuid)
             AND status = 'completed'
           ORDER BY actual_end DESC NULLS LAST
           LIMIT 10`,
          [driverId],
        ),
        this.pool.query(
          `SELECT fl.id, fl.fuel_station_name, fl.total_cost::float8 AS total_cost, fl.quantity::float8 AS quantity, fl.filled_at
           FROM fuel_logs fl
           WHERE ($1::uuid IS NULL OR fl.driver_id = $1::uuid)
           ORDER BY fl.filled_at DESC
           LIMIT 10`,
          [driverId],
        ),
        this.getNotifications(filters),
      ]);
      return {
        role: normalizedRole,
        current_trip: currentTrip.rows[0] || null,
        todays_trips: todayTrips.rows,
        upcoming_trips: upcomingTrips.rows,
        completed_trips: completedTrips.rows,
        fuel_logs: fuelLogs.rows,
        notifications,
      };
    }

    const [overview, fleet, trips, drivers, fuel, expenses, maintenance, finance, live, notifications] = await Promise.all([
      this.getOverview(filters),
      this.getFleet(filters),
      this.getTrips(filters),
      this.getDrivers(filters),
      this.getFuel(filters),
      this.getExpenses(filters),
      this.getMaintenance(filters),
      this.getFinance(filters),
      this.getLive(filters),
      this.getNotifications(filters),
    ]);

    return {
      role: "admin",
      executive_kpis: overview,
      fleet_analytics: fleet,
      trip_analytics: trips,
      driver_analytics: drivers,
      fuel_analytics: fuel,
      expense_analytics: expenses,
      maintenance_analytics: maintenance,
      financial_analytics: finance,
      live_operations: live,
      notifications,
    };
  }

  async getFiltersMetadata() {
    const [vehiclesResult, driversResult, tripsResult, regionsResult, fuelTypesResult] = await Promise.all([
      this.pool.query(
        `SELECT
          id,
          registration_number,
          CONCAT(make, ' ', model) AS vehicle_name
         FROM vehicles
         ORDER BY registration_number ASC`,
      ),
      this.pool.query(
        `SELECT
          d.id,
          u.full_name
         FROM drivers d
         INNER JOIN users u ON u.id = d.user_id
         ORDER BY u.full_name ASC`,
      ),
      this.pool.query(
        `SELECT
          id,
          origin,
          destination
         FROM trips
         ORDER BY scheduled_start DESC
         LIMIT 100`,
      ),
      this.pool.query(
        `SELECT DISTINCT region
         FROM (
           SELECT origin AS region FROM trips WHERE origin IS NOT NULL
           UNION
           SELECT destination AS region FROM trips WHERE destination IS NOT NULL
           UNION
           SELECT city AS region FROM fuel_logs WHERE city IS NOT NULL
           UNION
           SELECT state AS region FROM fuel_logs WHERE state IS NOT NULL
         ) regions
         WHERE region IS NOT NULL AND region <> ''
         ORDER BY region ASC`,
      ),
      this.pool.query(
        `SELECT unnest(enum_range(NULL::fuel_type))::text AS fuel_type
         ORDER BY fuel_type ASC`,
      ),
    ]);

    return {
      vehicles: vehiclesResult.rows,
      drivers: driversResult.rows,
      trips: tripsResult.rows,
      regions: regionsResult.rows.map((row) => row.region),
      fuel_types: fuelTypesResult.rows.map((row) => row.fuel_type),
    };
  }

  async getOverview(filters: DashboardFilters) {
    const tripFilter = buildTripFilter(filters);
    const fuelFilter = buildFuelFilter(filters);
    const expenseFilter = buildExpenseFilter(filters);

    const [vehiclesResult, tripsResult, driversResult, fuelTodayResult, fuelMonthResult, operatingCostResult] =
      await Promise.all([
        this.pool.query(
          `SELECT
            COUNT(*)::int AS total_vehicles,
            COUNT(*) FILTER (WHERE status = 'available')::int AS available_vehicles,
            COUNT(*) FILTER (WHERE status = 'assigned')::int AS vehicles_in_trip,
            COUNT(*) FILTER (WHERE status = 'maintenance')::int AS vehicles_in_maintenance
           FROM vehicles`,
        ),
        this.pool.query(
          `SELECT
            COUNT(*) FILTER (WHERE status = 'in_progress')::int AS active_trips,
            COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_trips,
            COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled_trips
           FROM trips t
           ${tripFilter.clause}`,
          tripFilter.values,
        ),
        this.pool.query(
          `SELECT
            COUNT(*) FILTER (WHERE status = 'on_trip')::int AS drivers_on_duty,
            COUNT(*) FILTER (WHERE status = 'available')::int AS drivers_available
           FROM drivers d`,
        ),
        this.pool.query(
          `SELECT COALESCE(SUM(total_cost), 0)::float8 AS fuel_cost_today
           FROM fuel_logs fl
           WHERE fl.filled_at::date = CURRENT_DATE
             ${
               fuelFilter.clause
                 ? `AND ${fuelFilter.clause.replace(/^WHERE\s+/i, "")}`
                 : ""
             }`,
          fuelFilter.values,
        ),
        this.pool.query(
          `SELECT COALESCE(SUM(total_cost), 0)::float8 AS fuel_cost_this_month
           FROM fuel_logs fl
           WHERE DATE_TRUNC('month', fl.filled_at) = DATE_TRUNC('month', CURRENT_DATE)
             ${
               fuelFilter.clause
                 ? `AND ${fuelFilter.clause.replace(/^WHERE\s+/i, "")}`
                 : ""
             }`,
          fuelFilter.values,
        ),
        this.pool.query(
          `SELECT (
              COALESCE((
                SELECT SUM(e.amount)
                FROM expenses e
                WHERE DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', CURRENT_DATE)
                  ${expenseFilter.clause ? `AND ${expenseFilter.clause.replace(/^WHERE\s+/i, "")}` : ""}
              ), 0)
              +
              COALESCE((
                SELECT SUM(fl.total_cost)
                FROM fuel_logs fl
                WHERE DATE_TRUNC('month', fl.filled_at) = DATE_TRUNC('month', CURRENT_DATE)
                  ${fuelFilter.clause ? `AND ${fuelFilter.clause.replace(/^WHERE\s+/i, "")}` : ""}
              ), 0)
              +
              COALESCE((
                SELECT SUM(m.cost)
                FROM maintenance_records m
                WHERE DATE_TRUNC('month', m.scheduled_date) = DATE_TRUNC('month', CURRENT_DATE)
                  AND m.cost IS NOT NULL
                  ${filters.vehicle_id ? `AND m.vehicle_id = $${expenseFilter.values.length + fuelFilter.values.length + 1}` : ""}
              ), 0)
            )::float8 AS monthly_operating_cost`,
          filters.vehicle_id
            ? [...expenseFilter.values, ...fuelFilter.values, filters.vehicle_id]
            : [...expenseFilter.values, ...fuelFilter.values],
        ),
      ]);

    const vehicleRow = vehiclesResult.rows[0];
    const tripRow = tripsResult.rows[0];
    const driverRow = driversResult.rows[0];
    const fuelToday = Number(fuelTodayResult.rows[0]?.fuel_cost_today || 0);
    const fuelMonth = Number(fuelMonthResult.rows[0]?.fuel_cost_this_month || 0);
    const monthlyOperatingCost = Number(operatingCostResult.rows[0]?.monthly_operating_cost || 0);
    const totalVehicles = Number(vehicleRow.total_vehicles || 0);
    const activeVehicles = Number(vehicleRow.available_vehicles || 0) + Number(vehicleRow.vehicles_in_trip || 0);
    const fleetUtilization = totalVehicles > 0 ? Number(((activeVehicles / totalVehicles) * 100).toFixed(2)) : 0;

    return {
      kpis: [
        metric("total_vehicles", Number(vehicleRow.total_vehicles || 0)),
        metric("available_vehicles", Number(vehicleRow.available_vehicles || 0)),
        metric("vehicles_in_trip", Number(vehicleRow.vehicles_in_trip || 0)),
        metric("vehicles_in_maintenance", Number(vehicleRow.vehicles_in_maintenance || 0)),
        metric("active_trips", Number(tripRow.active_trips || 0)),
        metric("completed_trips", Number(tripRow.completed_trips || 0)),
        metric("cancelled_trips", Number(tripRow.cancelled_trips || 0)),
        metric("drivers_on_duty", Number(driverRow.drivers_on_duty || 0)),
        metric("drivers_available", Number(driverRow.drivers_available || 0)),
        metric("fleet_utilization", fleetUtilization, "percent"),
        metric("fuel_cost_today", fuelToday, "currency"),
        metric("fuel_cost_this_month", fuelMonth, "currency"),
        metric("monthly_operating_cost", monthlyOperatingCost, "currency"),
      ],
    };
  }

  async getFleet(filters: DashboardFilters) {
    const tripFilter = buildTripFilter(filters);
    const [statusResult, utilizationResult, distributionResult, distanceResult] = await Promise.all([
      this.pool.query(
        `SELECT status AS label, COUNT(*)::int AS value
         FROM vehicles
         GROUP BY status
         ORDER BY status`,
      ),
      this.pool.query(
        `SELECT
          v.id,
          v.registration_number,
          CONCAT(v.make, ' ', v.model) AS vehicle_name,
          COUNT(t.id)::int AS trip_count
         FROM vehicles v
         LEFT JOIN trips t ON t.vehicle_id = v.id
         ${tripFilter.clause ? tripFilter.clause.replace(/t\./g, "t.") : ""}
         GROUP BY v.id, v.registration_number, v.make, v.model
         ORDER BY trip_count DESC, v.registration_number ASC`,
        tripFilter.values,
      ),
      this.pool.query(
        `SELECT fuel_type AS label, COUNT(*)::int AS value
         FROM vehicles
         GROUP BY fuel_type
         ORDER BY value DESC, fuel_type ASC`,
      ),
      this.pool.query(
        `SELECT COALESCE(AVG(estimated_distance_km), 0)::float8 AS average_distance
         FROM trips t
         ${tripFilter.clause}`,
        tripFilter.values,
      ),
    ]);

    const utilizationRows = utilizationResult.rows;

    return {
      fleet_status: statusResult.rows,
      vehicle_utilization: utilizationRows.slice(0, 8).map((row) => ({
        id: row.id,
        label: row.registration_number,
        vehicle_name: row.vehicle_name,
        value: Number(row.trip_count || 0),
      })),
      vehicle_distribution: distributionResult.rows,
      most_used_vehicle: utilizationRows[0]
        ? {
            id: utilizationRows[0].id,
            registration_number: utilizationRows[0].registration_number,
            vehicle_name: utilizationRows[0].vehicle_name,
            trip_count: Number(utilizationRows[0].trip_count || 0),
          }
        : null,
      least_used_vehicle: utilizationRows[utilizationRows.length - 1]
        ? {
            id: utilizationRows[utilizationRows.length - 1].id,
            registration_number: utilizationRows[utilizationRows.length - 1].registration_number,
            vehicle_name: utilizationRows[utilizationRows.length - 1].vehicle_name,
            trip_count: Number(utilizationRows[utilizationRows.length - 1].trip_count || 0),
          }
        : null,
      average_distance: Number(distanceResult.rows[0]?.average_distance || 0),
    };
  }

  async getTrips(filters: DashboardFilters) {
    const tripFilter = buildTripFilter(filters);
    const [summaryResult, byVehicleResult, byDriverResult, byRegionResult] = await Promise.all([
      this.pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE t.scheduled_start::date = CURRENT_DATE)::int AS trips_today,
          COUNT(*) FILTER (WHERE t.scheduled_start >= DATE_TRUNC('week', CURRENT_DATE))::int AS trips_this_week,
          COUNT(*) FILTER (WHERE DATE_TRUNC('month', t.scheduled_start) = DATE_TRUNC('month', CURRENT_DATE))::int AS trips_this_month,
          COUNT(*) FILTER (WHERE t.status = 'completed')::int AS completed_trips,
          COUNT(*) FILTER (
            WHERE (t.status = 'in_progress' AND t.scheduled_end < NOW())
               OR (t.status = 'completed' AND t.actual_end IS NOT NULL AND t.actual_end > t.scheduled_end)
          )::int AS delayed_trips
         FROM trips t
         ${tripFilter.clause}`,
        tripFilter.values,
      ),
      this.pool.query(
        `SELECT
          v.registration_number AS label,
          COUNT(t.id)::int AS value
         FROM trips t
         INNER JOIN vehicles v ON v.id = t.vehicle_id
         ${tripFilter.clause}
         GROUP BY v.registration_number
         ORDER BY value DESC, label ASC
         LIMIT 8`,
        tripFilter.values,
      ),
      this.pool.query(
        `SELECT
          u.full_name AS label,
          COUNT(t.id)::int AS value
         FROM trips t
         INNER JOIN drivers d ON d.id = t.driver_id
         INNER JOIN users u ON u.id = d.user_id
         ${tripFilter.clause}
         GROUP BY u.full_name
         ORDER BY value DESC, label ASC
         LIMIT 8`,
        tripFilter.values,
      ),
      this.pool.query(
        `SELECT
          t.destination AS label,
          COUNT(*)::int AS value
         FROM trips t
         ${tripFilter.clause}
         GROUP BY t.destination
         ORDER BY value DESC, label ASC
         LIMIT 8`,
        tripFilter.values,
      ),
    ]);

    return {
      summary: summaryResult.rows[0],
      trips_by_vehicle: byVehicleResult.rows,
      trips_by_driver: byDriverResult.rows,
      trips_by_region: byRegionResult.rows,
    };
  }

  async getDrivers(filters: DashboardFilters) {
    const driverFilter = buildDriverFilter(filters);
    const tripFilter = buildTripFilter(filters);
    const [summaryResult, expiringResult, tripsPerDriverResult, distancePerDriverResult] = await Promise.all([
      this.pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'available')::int AS drivers_available,
          COUNT(*) FILTER (WHERE status = 'on_trip')::int AS drivers_on_trip,
          COUNT(*) FILTER (WHERE status IN ('on_leave', 'inactive'))::int AS drivers_off_duty
         FROM drivers d
         ${driverFilter.clause}`,
        driverFilter.values,
      ),
      this.pool.query(
        `SELECT
          d.id,
          u.full_name,
          d.license_number,
          d.license_expiry
         FROM drivers d
         INNER JOIN users u ON u.id = d.user_id
         WHERE d.license_expiry <= CURRENT_DATE + INTERVAL '30 days'
         ORDER BY d.license_expiry ASC
         LIMIT 10`,
      ),
      this.pool.query(
        `SELECT
          u.full_name AS label,
          COUNT(t.id)::int AS value
         FROM drivers d
         INNER JOIN users u ON u.id = d.user_id
         LEFT JOIN trips t ON t.driver_id = d.id
         ${tripFilter.clause ? tripFilter.clause.replace("WHERE", "WHERE") : ""}
         GROUP BY u.full_name
         ORDER BY value DESC, label ASC
         LIMIT 8`,
        tripFilter.values,
      ),
      this.pool.query(
        `SELECT
          u.full_name AS label,
          COALESCE(SUM(t.estimated_distance_km), 0)::float8 AS value
         FROM drivers d
         INNER JOIN users u ON u.id = d.user_id
         LEFT JOIN trips t ON t.driver_id = d.id
         ${tripFilter.clause ? tripFilter.clause.replace("WHERE", "WHERE") : ""}
         GROUP BY u.full_name
         ORDER BY value DESC, label ASC
         LIMIT 8`,
        tripFilter.values,
      ),
    ]);

    return {
      summary: {
        ...summaryResult.rows[0],
        license_expiring: expiringResult.rows.length,
      },
      license_expiring: expiringResult.rows,
      trips_per_driver: tripsPerDriverResult.rows,
      distance_per_driver: distancePerDriverResult.rows,
    };
  }

  async getFuel(filters: DashboardFilters) {
    const fuelFilter = buildFuelFilter(filters);
    const [summaryResult, trendResult, consumptionTrendResult, byVehicleResult, byDriverResult, byCityResult, typeResult, recentResult] =
      await Promise.all([
        this.pool.query(
          `SELECT
            COUNT(*) FILTER (WHERE fl.filled_at::date = CURRENT_DATE)::int AS fuel_logs_today,
            COALESCE(SUM(fl.total_cost) FILTER (WHERE fl.filled_at::date = CURRENT_DATE), 0)::float8 AS fuel_cost_today,
            COALESCE(SUM(fl.total_cost) FILTER (WHERE DATE_TRUNC('month', fl.filled_at) = DATE_TRUNC('month', CURRENT_DATE)), 0)::float8 AS fuel_cost_this_month,
            COALESCE(AVG(fl.total_cost), 0)::float8 AS average_fuel_cost
           FROM fuel_logs fl
           ${fuelFilter.clause}`,
          fuelFilter.values,
        ),
        this.pool.query(
          `SELECT
            TO_CHAR(DATE_TRUNC('month', fl.filled_at), 'YYYY-MM') AS label,
            COALESCE(SUM(fl.total_cost), 0)::float8 AS value
           FROM fuel_logs fl
           ${fuelFilter.clause}
           GROUP BY DATE_TRUNC('month', fl.filled_at)
           ORDER BY DATE_TRUNC('month', fl.filled_at) ASC`,
          fuelFilter.values,
        ),
        this.pool.query(
          `SELECT
            TO_CHAR(DATE_TRUNC('month', fl.filled_at), 'YYYY-MM') AS label,
            COALESCE(SUM(fl.quantity), 0)::float8 AS value
           FROM fuel_logs fl
           ${fuelFilter.clause}
           GROUP BY DATE_TRUNC('month', fl.filled_at)
           ORDER BY DATE_TRUNC('month', fl.filled_at) ASC`,
          fuelFilter.values,
        ),
        this.pool.query(
          `SELECT
            v.registration_number AS label,
            COALESCE(SUM(fl.total_cost), 0)::float8 AS value
           FROM fuel_logs fl
           INNER JOIN vehicles v ON v.id = fl.vehicle_id
           ${fuelFilter.clause}
           GROUP BY v.registration_number
           ORDER BY value DESC, label ASC
           LIMIT 8`,
          fuelFilter.values,
        ),
        this.pool.query(
          `SELECT
            u.full_name AS label,
            COALESCE(SUM(fl.total_cost), 0)::float8 AS value
           FROM fuel_logs fl
           INNER JOIN drivers d ON d.id = fl.driver_id
           INNER JOIN users u ON u.id = d.user_id
           ${fuelFilter.clause}
           GROUP BY u.full_name
           ORDER BY value DESC, label ASC
           LIMIT 8`,
          fuelFilter.values,
        ),
        this.pool.query(
          `SELECT
            COALESCE(fl.city, 'Unknown') AS label,
            COALESCE(SUM(fl.total_cost), 0)::float8 AS value
           FROM fuel_logs fl
           ${fuelFilter.clause}
           GROUP BY COALESCE(fl.city, 'Unknown')
           ORDER BY value DESC, label ASC
           LIMIT 8`,
          fuelFilter.values,
        ),
        this.pool.query(
          `SELECT
            fl.fuel_type AS label,
            COUNT(*)::int AS value
           FROM fuel_logs fl
           ${fuelFilter.clause}
           GROUP BY fl.fuel_type
           ORDER BY value DESC, label ASC`,
          fuelFilter.values,
        ),
        this.pool.query(
          `SELECT
            fl.id,
            fl.fuel_station_name,
            fl.city,
            fl.total_cost::float8 AS total_cost,
            fl.quantity::float8 AS quantity,
            fl.filled_at,
            v.registration_number,
            u.full_name AS driver_name
           FROM fuel_logs fl
           INNER JOIN vehicles v ON v.id = fl.vehicle_id
           INNER JOIN drivers d ON d.id = fl.driver_id
           INNER JOIN users u ON u.id = d.user_id
           ${fuelFilter.clause}
           ORDER BY fl.filled_at DESC
           LIMIT 10`,
          fuelFilter.values,
        ),
      ]);

    return {
      summary: summaryResult.rows[0],
      fuel_spending_trend: trendResult.rows,
      fuel_consumption_trend: consumptionTrendResult.rows,
      fuel_cost_by_vehicle: byVehicleResult.rows,
      fuel_cost_by_driver: byDriverResult.rows,
      fuel_cost_by_city: byCityResult.rows,
      fuel_type_distribution: typeResult.rows,
      recent_fuel_logs: recentResult.rows,
    };
  }

  async getExpenses(filters: DashboardFilters) {
    const expenseFilter = buildExpenseFilter(filters);
    const [summaryResult, trendResult, breakdownResult, byVehicleResult] = await Promise.all([
      this.pool.query(
        `SELECT
          COALESCE(SUM(amount), 0)::float8 AS total_expenses,
          COALESCE(SUM(amount) FILTER (WHERE category = 'fuel'), 0)::float8 AS fuel_expenses,
          COALESCE(SUM(amount) FILTER (WHERE category = 'maintenance'), 0)::float8 AS maintenance_expenses,
          COALESCE(SUM(amount) FILTER (WHERE category NOT IN ('fuel', 'maintenance')), 0)::float8 AS operational_expenses
         FROM expenses e
         ${expenseFilter.clause}`,
        expenseFilter.values,
      ),
      this.pool.query(
        `SELECT
          TO_CHAR(DATE_TRUNC('month', e.expense_date), 'YYYY-MM') AS label,
          COALESCE(SUM(e.amount), 0)::float8 AS value
         FROM expenses e
         ${expenseFilter.clause}
         GROUP BY DATE_TRUNC('month', e.expense_date)
         ORDER BY DATE_TRUNC('month', e.expense_date) ASC`,
        expenseFilter.values,
      ),
      this.pool.query(
        `SELECT
          e.category AS label,
          COALESCE(SUM(e.amount), 0)::float8 AS value
         FROM expenses e
         ${expenseFilter.clause}
         GROUP BY e.category
         ORDER BY value DESC, label ASC`,
        expenseFilter.values,
      ),
      this.pool.query(
        `SELECT
          v.registration_number AS label,
          COALESCE(SUM(e.amount), 0)::float8 AS value
         FROM expenses e
         INNER JOIN vehicles v ON v.id = e.vehicle_id
         ${expenseFilter.clause}
         GROUP BY v.registration_number
         ORDER BY value DESC, label ASC
         LIMIT 8`,
        expenseFilter.values,
      ),
    ]);

    return {
      summary: summaryResult.rows[0],
      expense_trend: trendResult.rows,
      expense_breakdown: breakdownResult.rows,
      expense_by_vehicle: byVehicleResult.rows,
    };
  }

  async getMaintenance(filters: DashboardFilters) {
    const maintenanceFilter = buildMaintenanceFilter(filters);
    const [summaryResult, downtimeResult, servicedResult] = await Promise.all([
      this.pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'scheduled')::int AS scheduled,
          COUNT(*) FILTER (WHERE status IN ('scheduled', 'in_progress') AND scheduled_date < CURRENT_DATE)::int AS overdue,
          COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
          COALESCE(SUM(cost), 0)::float8 AS maintenance_cost
         FROM maintenance_records m
         ${maintenanceFilter.clause}`,
        maintenanceFilter.values,
      ),
      this.pool.query(
        `SELECT
          COALESCE(SUM(
            CASE
              WHEN status = 'completed' AND completed_date IS NOT NULL THEN completed_date - scheduled_date
              WHEN status IN ('scheduled', 'in_progress') THEN CURRENT_DATE - scheduled_date
              ELSE 0
            END
          ), 0)::int AS downtime_days
         FROM maintenance_records m
         ${maintenanceFilter.clause}`,
        maintenanceFilter.values,
      ),
      this.pool.query(
        `SELECT
          v.registration_number AS label,
          COUNT(m.id)::int AS value
         FROM maintenance_records m
         INNER JOIN vehicles v ON v.id = m.vehicle_id
         ${maintenanceFilter.clause}
         GROUP BY v.registration_number
         ORDER BY value DESC, label ASC
         LIMIT 8`,
        maintenanceFilter.values,
      ),
    ]);

    return {
      summary: {
        ...summaryResult.rows[0],
        downtime: Number(downtimeResult.rows[0]?.downtime_days || 0),
      },
      most_serviced_vehicles: servicedResult.rows,
    };
  }

  async getFinance(filters: DashboardFilters) {
    const tripFilter = buildTripFilter(filters);
    const fuelFilter = buildFuelFilter(filters);
    const expenseFilter = buildExpenseFilter(filters);
    const maintenanceFilter = buildMaintenanceFilter(filters);

    const [costsResult, tripResult] = await Promise.all([
      this.pool.query(
        `SELECT
          COALESCE((
            SELECT SUM(total_cost) FROM fuel_logs fl ${fuelFilter.clause}
          ), 0)::float8 AS fuel_cost,
          COALESCE((
            SELECT SUM(cost) FROM maintenance_records m ${maintenanceFilter.clause}
          ), 0)::float8 AS maintenance_cost,
          COALESCE((
            SELECT SUM(amount) FROM expenses e ${expenseFilter.clause}
          ), 0)::float8 AS other_expenses`,
        [...fuelFilter.values, ...maintenanceFilter.values, ...expenseFilter.values],
      ),
      this.pool.query(
        `SELECT
          COUNT(*)::int AS trip_count,
          COALESCE(SUM(estimated_distance_km), 0)::float8 AS distance_total
         FROM trips t
         ${tripFilter.clause}`,
        tripFilter.values,
      ),
    ]);

    const fuelCost = Number(costsResult.rows[0]?.fuel_cost || 0);
    const maintenanceCost = Number(costsResult.rows[0]?.maintenance_cost || 0);
    const otherExpenses = Number(costsResult.rows[0]?.other_expenses || 0);
    const total = fuelCost + maintenanceCost + otherExpenses;
    const tripCount = Number(tripResult.rows[0]?.trip_count || 0);
    const distanceTotal = Number(tripResult.rows[0]?.distance_total || 0);

    return {
      summary: {
        monthly_operating_cost: total,
        cost_per_trip: tripCount > 0 ? Number((total / tripCount).toFixed(2)) : 0,
        cost_per_kilometer: distanceTotal > 0 ? Number((total / distanceTotal).toFixed(2)) : 0,
        fuel_percentage: total > 0 ? Number(((fuelCost / total) * 100).toFixed(2)) : 0,
        maintenance_percentage: total > 0 ? Number(((maintenanceCost / total) * 100).toFixed(2)) : 0,
      },
      expense_distribution: [
        { label: "Fuel", value: fuelCost },
        { label: "Maintenance", value: maintenanceCost },
        { label: "Other", value: otherExpenses },
      ],
    };
  }

  async getLive(filters: DashboardFilters) {
    const tripFilter = buildTripFilter(filters);
    const [vehiclesOnTripResult, driversActiveResult, tripsInProgressResult] = await Promise.all([
      this.pool.query(
        `SELECT
          t.id,
          v.registration_number,
          CONCAT(v.make, ' ', v.model) AS vehicle_name,
          t.origin,
          t.destination,
          t.scheduled_end
         FROM trips t
         INNER JOIN vehicles v ON v.id = t.vehicle_id
         WHERE t.status = 'in_progress'
           ${tripFilter.clause ? `AND ${tripFilter.clause.replace(/^WHERE\s+/i, "")}` : ""}
         ORDER BY t.scheduled_end ASC
         LIMIT 10`,
        tripFilter.values,
      ),
      this.pool.query(
        `SELECT
          d.id,
          u.full_name,
          d.status
         FROM drivers d
         INNER JOIN users u ON u.id = d.user_id
         WHERE d.status = 'on_trip'
         ORDER BY u.full_name ASC
         LIMIT 10`,
      ),
      this.pool.query(
        `SELECT
          COUNT(*)::int AS trips_in_progress,
          COUNT(*) FILTER (
            WHERE t.status = 'in_progress'
              AND t.scheduled_end <= NOW() + INTERVAL '30 minutes'
          )::int AS vehicles_near_destination
         FROM trips t
         ${tripFilter.clause}`,
        tripFilter.values,
      ),
    ]);

    return {
      vehicles_currently_on_trip: vehiclesOnTripResult.rows,
      drivers_active: driversActiveResult.rows,
      summary: tripsInProgressResult.rows[0],
    };
  }

  async getNotifications(_filters: DashboardFilters) {
    const [notificationsResult, maintenanceDueResult, insuranceExpiringResult, licenseExpiringResult, vehicleOfflineResult, tripDelaysResult] =
      await Promise.all([
        this.pool.query(
          `SELECT
            id,
            title,
            message,
            status,
            created_at
           FROM notifications
           ORDER BY created_at DESC
           LIMIT 8`,
        ),
        this.pool.query(
          `SELECT
            m.id,
            v.registration_number,
            m.type,
            m.scheduled_date
           FROM maintenance_records m
           INNER JOIN vehicles v ON v.id = m.vehicle_id
           WHERE m.status IN ('scheduled', 'in_progress')
             AND m.scheduled_date <= CURRENT_DATE + INTERVAL '7 days'
           ORDER BY m.scheduled_date ASC
           LIMIT 8`,
        ),
        this.pool.query(
          `SELECT
            id,
            registration_number,
            insurance_expiry
           FROM vehicles
           WHERE insurance_expiry IS NOT NULL
             AND insurance_expiry <= CURRENT_DATE + INTERVAL '30 days'
           ORDER BY insurance_expiry ASC
           LIMIT 8`,
        ),
        this.pool.query(
          `SELECT
            d.id,
            u.full_name,
            d.license_expiry
           FROM drivers d
           INNER JOIN users u ON u.id = d.user_id
           WHERE d.license_expiry <= CURRENT_DATE + INTERVAL '30 days'
           ORDER BY d.license_expiry ASC
           LIMIT 8`,
        ),
        this.pool.query(
          `SELECT
            id,
            registration_number,
            status
           FROM vehicles
           WHERE status = 'inactive'
           ORDER BY updated_at DESC
           LIMIT 8`,
        ),
        this.pool.query(
          `SELECT
            t.id,
            v.registration_number,
            t.origin,
            t.destination,
            t.scheduled_end
           FROM trips t
           INNER JOIN vehicles v ON v.id = t.vehicle_id
           WHERE (t.status = 'in_progress' AND t.scheduled_end < NOW())
              OR (t.status = 'completed' AND t.actual_end IS NOT NULL AND t.actual_end > t.scheduled_end)
           ORDER BY t.scheduled_end ASC
           LIMIT 8`,
        ),
      ]);

    return {
      feed: notificationsResult.rows,
      maintenance_due: maintenanceDueResult.rows,
      insurance_expiring: insuranceExpiringResult.rows,
      license_expiring: licenseExpiringResult.rows,
      vehicle_offline: vehicleOfflineResult.rows,
      trip_delays: tripDelaysResult.rows,
    };
  }
}
