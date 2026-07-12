import { Pool } from "pg";
import { createSimplePdf, toCsv } from "../utils/reportExport";

type ExportFormat = "json" | "csv" | "pdf";

function normalizeFormat(input?: string): ExportFormat {
  if (input === "csv" || input === "pdf") return input;
  return "json";
}

export class ReportService {
  constructor(private readonly pool: Pool) {}

  private reportTitle(type: string) {
    const titles: Record<string, string> = {
      fuel: "Fuel Report",
      expense: "Expense Report",
      trip: "Trip Report",
      vehicle: "Vehicle Report",
      driver: "Driver Report",
      maintenance: "Maintenance Report",
      fleet_summary: "Fleet Summary Report",
      financial_summary: "Financial Summary Report",
      summary: "Fleet Summary Report",
      financial: "Financial Summary Report",
    };
    return titles[type] || `${type} Report`;
  }

  private async queryRows(type: string, filters: Record<string, string | undefined>) {
    switch (type) {
      case "fuel":
        return this.pool.query(
          `SELECT
            v.registration_number AS vehicle,
            COALESCE(u.full_name, '') AS driver,
            CONCAT(COALESCE(t.origin, ''), ' -> ', COALESCE(t.destination, '')) AS trip,
            fl.fuel_station_name,
            COALESCE(fl.fuel_station_address, '') AS fuel_station_address,
            COALESCE(fl.city, '') AS city,
            COALESCE(fl.state, '') AS state,
            fl.fuel_type,
            fl.quantity::float8 AS quantity,
            fl.price_per_unit::float8 AS unit_price,
            fl.total_cost::float8 AS total_cost,
            fl.odometer::float8 AS odometer,
            COALESCE(
              ROUND((fl.quantity / NULLIF(fl.odometer - LAG(fl.odometer) OVER (PARTITION BY fl.vehicle_id ORDER BY fl.filled_at), 0))::numeric, 4),
              0
            )::float8 AS fuel_efficiency,
            TO_CHAR(fl.filled_at, 'YYYY-MM-DD') AS filled_date,
            fl.payment_method,
            fl.receipt_number,
            COALESCE(fl.receipt_image, '') AS receipt_image,
            COALESCE(fl.remarks, '') AS remarks
          FROM fuel_logs fl
          INNER JOIN vehicles v ON v.id = fl.vehicle_id
          LEFT JOIN drivers d ON d.id = fl.driver_id
          LEFT JOIN users u ON u.id = d.user_id
          LEFT JOIN trips t ON t.id = fl.trip_id
          WHERE ($1::date IS NULL OR fl.filled_at::date >= $1::date)
            AND ($2::date IS NULL OR fl.filled_at::date <= $2::date)
            AND ($3::uuid IS NULL OR fl.vehicle_id = $3::uuid)
            AND ($4::uuid IS NULL OR fl.driver_id = $4::uuid)
            AND ($5::text IS NULL OR fl.fuel_type = $5::text)
            AND ($6::text IS NULL OR fl.city ILIKE $6::text)
            AND ($7::text IS NULL OR fl.state ILIKE $7::text)
          ORDER BY fl.filled_at DESC`,
          [
            filters.date_from || null,
            filters.date_to || null,
            filters.vehicle_id || null,
            filters.driver_id || null,
            filters.fuel_type || null,
            filters.city ? `%${filters.city}%` : null,
            filters.state ? `%${filters.state}%` : null,
          ],
        );
      case "expense":
        return this.pool.query(
          `SELECT
            v.registration_number AS vehicle,
            COALESCE(u.full_name, '') AS driver,
            CONCAT(COALESCE(t.origin, ''), ' -> ', COALESCE(t.destination, '')) AS trip,
            e.category AS expense_category,
            COALESCE(e.vendor_name, e.vendor, '') AS vendor,
            COALESCE(e.invoice_number, '') AS invoice_number,
            COALESCE(e.receipt_number, '') AS receipt_number,
            COALESCE(e.receipt_image, '') AS receipt_image,
            e.amount::float8 AS amount,
            e.tax::float8 AS tax,
            e.discount::float8 AS discount,
            COALESCE(e.total_amount, e.amount + e.tax - e.discount)::float8 AS net_amount,
            COALESCE(e.payment_method, '') AS payment_method,
            TO_CHAR(e.expense_date, 'YYYY-MM-DD') AS expense_date,
            COALESCE(e.description, '') AS description,
            e.expense_status AS status,
            COALESCE(approver.full_name, '') AS approved_by,
            COALESCE(e.remarks, '') AS remarks
          FROM expenses e
          INNER JOIN vehicles v ON v.id = e.vehicle_id
          LEFT JOIN drivers d ON d.id = e.driver_id
          LEFT JOIN users u ON u.id = d.user_id
          LEFT JOIN trips t ON t.id = e.trip_id
          LEFT JOIN users approver ON approver.id = e.approved_by
          WHERE ($1::date IS NULL OR e.expense_date >= $1::date)
            AND ($2::date IS NULL OR e.expense_date <= $2::date)
            AND ($3::uuid IS NULL OR e.vehicle_id = $3::uuid)
            AND ($4::text IS NULL OR e.category = $4::text)
            AND ($5::text IS NULL OR COALESCE(e.vendor_name, e.vendor, '') ILIKE $5::text)
            AND ($6::uuid IS NULL OR e.driver_id = $6::uuid)
            AND ($7::uuid IS NULL OR e.trip_id = $7::uuid)
            AND ($8::text IS NULL OR e.payment_method = $8::text)
            AND ($9::text IS NULL OR e.expense_status = $9::text)
          ORDER BY e.expense_date DESC`,
          [
            filters.date_from || null,
            filters.date_to || null,
            filters.vehicle_id || null,
            filters.category || filters.expense_category || null,
            filters.vendor ? `%${filters.vendor}%` : null,
            filters.driver_id || null,
            filters.trip_id || null,
            filters.payment_method || null,
            filters.status || filters.expense_status || null,
          ],
        );
      case "vehicle":
        return this.pool.query(
          `SELECT
            registration_number,
            make,
            model,
            year,
            fuel_type,
            status,
            current_odometer::float8 AS current_odometer
          FROM vehicles
          ORDER BY registration_number ASC`,
        );
      case "driver":
        return this.pool.query(
          `SELECT
            u.full_name,
            u.email,
            d.license_number,
            TO_CHAR(d.license_expiry, 'YYYY-MM-DD') AS license_expiry,
            d.status,
            TO_CHAR(d.hire_date, 'YYYY-MM-DD') AS hire_date
          FROM drivers d
          INNER JOIN users u ON u.id = d.user_id
          ORDER BY u.full_name ASC`,
        );
      case "trip":
        return this.pool.query(
          `SELECT
            v.registration_number AS vehicle,
            u.full_name AS driver,
            t.origin,
            t.destination,
            t.status,
            t.estimated_distance_km::float8 AS estimated_distance_km,
            t.estimated_duration_minutes,
            TO_CHAR(t.scheduled_start, 'YYYY-MM-DD"T"HH24:MI') AS scheduled_start,
            TO_CHAR(t.scheduled_end, 'YYYY-MM-DD"T"HH24:MI') AS scheduled_end
          FROM trips t
          INNER JOIN vehicles v ON v.id = t.vehicle_id
          INNER JOIN drivers d ON d.id = t.driver_id
          INNER JOIN users u ON u.id = d.user_id
          ORDER BY t.scheduled_start DESC`,
        );
      case "maintenance":
        return this.pool.query(
          `SELECT
            v.registration_number AS vehicle,
            m.type,
            m.status,
            TO_CHAR(m.scheduled_date, 'YYYY-MM-DD') AS scheduled_date,
            TO_CHAR(m.completed_date, 'YYYY-MM-DD') AS completed_date,
            m.cost::float8 AS cost,
            COALESCE(m.notes, '') AS notes
          FROM maintenance_records m
          INNER JOIN vehicles v ON v.id = m.vehicle_id
          ORDER BY m.scheduled_date DESC`,
        );
      case "fleet_summary":
      case "summary":
      case "financial_summary":
      case "financial":
      default:
        return this.pool.query(
          `SELECT
            COALESCE((SELECT SUM(total_cost) FROM fuel_logs), 0)::float8 AS total_fuel_cost,
            COALESCE((SELECT SUM(amount) FROM expenses WHERE category NOT IN ('fuel', 'maintenance')), 0)::float8 AS total_expense,
            COALESCE((SELECT SUM(cost) FROM maintenance_records), 0)::float8 AS maintenance_cost,
            COALESCE((SELECT AVG(total_cost) FROM fuel_logs), 0)::float8 AS average_fuel_cost,
            COALESCE((
              SELECT AVG(
                CASE WHEN quantity > 0 THEN total_cost / quantity ELSE 0 END
              )
              FROM fuel_logs
            ), 0)::float8 AS average_cost_per_km,
            COALESCE((
              SELECT v.registration_number
              FROM vehicles v
              INNER JOIN fuel_logs fl ON fl.vehicle_id = v.id
              GROUP BY v.registration_number
              ORDER BY SUM(fl.total_cost) DESC
              LIMIT 1
            ), '') AS top_spending_vehicle,
            COALESCE((
              SELECT u.full_name
              FROM drivers d
              INNER JOIN users u ON u.id = d.user_id
              INNER JOIN fuel_logs fl ON fl.driver_id = d.id
              GROUP BY u.full_name
              ORDER BY SUM(fl.total_cost) DESC
              LIMIT 1
            ), '') AS top_spending_driver`,
        );
    }
  }

  private async buildSummary(type: string, filters: Record<string, string | undefined>) {
    if (type === "expense") {
      const [totals, byCategory, byVehicle, byDriver, byVendor, monthly, weekly, daily] = await Promise.all([
        this.pool.query(
          `SELECT
            COALESCE(SUM(COALESCE(total_amount, amount + tax - discount)), 0)::float8 AS total_expenses,
            COALESCE(AVG(COALESCE(total_amount, amount + tax - discount)), 0)::float8 AS average_expense,
            COUNT(*)::int AS expense_count
           FROM expenses`,
        ),
        this.pool.query(
          `SELECT category AS label, COALESCE(SUM(COALESCE(total_amount, amount + tax - discount)), 0)::float8 AS value
           FROM expenses GROUP BY category ORDER BY value DESC`,
        ),
        this.pool.query(
          `SELECT v.registration_number AS label, COALESCE(SUM(COALESCE(e.total_amount, e.amount + e.tax - e.discount)), 0)::float8 AS value
           FROM expenses e INNER JOIN vehicles v ON v.id = e.vehicle_id GROUP BY v.registration_number ORDER BY value DESC LIMIT 10`,
        ),
        this.pool.query(
          `SELECT COALESCE(u.full_name, 'Unassigned') AS label, COALESCE(SUM(COALESCE(e.total_amount, e.amount + e.tax - e.discount)), 0)::float8 AS value
           FROM expenses e LEFT JOIN drivers d ON d.id = e.driver_id LEFT JOIN users u ON u.id = d.user_id GROUP BY COALESCE(u.full_name, 'Unassigned') ORDER BY value DESC LIMIT 10`,
        ),
        this.pool.query(
          `SELECT COALESCE(vendor_name, vendor, 'Unknown Vendor') AS label, COALESCE(SUM(COALESCE(total_amount, amount + tax - discount)), 0)::float8 AS value
           FROM expenses GROUP BY COALESCE(vendor_name, vendor, 'Unknown Vendor') ORDER BY value DESC LIMIT 10`,
        ),
        this.pool.query(
          `SELECT TO_CHAR(DATE_TRUNC('month', expense_date), 'YYYY-MM') AS label, COALESCE(SUM(COALESCE(total_amount, amount + tax - discount)), 0)::float8 AS value
           FROM expenses GROUP BY DATE_TRUNC('month', expense_date) ORDER BY DATE_TRUNC('month', expense_date)`,
        ),
        this.pool.query(
          `SELECT TO_CHAR(DATE_TRUNC('week', expense_date), 'YYYY-MM-DD') AS label, COALESCE(SUM(COALESCE(total_amount, amount + tax - discount)), 0)::float8 AS value
           FROM expenses GROUP BY DATE_TRUNC('week', expense_date) ORDER BY DATE_TRUNC('week', expense_date)`,
        ),
        this.pool.query(
          `SELECT TO_CHAR(expense_date, 'YYYY-MM-DD') AS label, COALESCE(SUM(COALESCE(total_amount, amount + tax - discount)), 0)::float8 AS value
           FROM expenses GROUP BY expense_date ORDER BY expense_date`,
        ),
      ]);

      return {
        totals: totals.rows[0],
        charts: {
          expenses_by_category: byCategory.rows,
          expenses_by_vehicle: byVehicle.rows,
          expenses_by_driver: byDriver.rows,
          expenses_by_vendor: byVendor.rows,
          monthly_expense_trend: monthly.rows,
          weekly_expense_trend: weekly.rows,
          daily_expense_trend: daily.rows,
        },
        insights: {
          highest_expense_category: byCategory.rows[0]?.label || "",
          top_spending_vehicle: byVehicle.rows[0]?.label || "",
          top_spending_driver: byDriver.rows[0]?.label || "",
          top_vendor: byVendor.rows[0]?.label || "",
        },
      };
    }

    if (type === "fuel") {
      const [totals, byVehicle, byDriver, byCity, byType, trend] = await Promise.all([
        this.pool.query(
          `SELECT
            COALESCE(SUM(total_cost), 0)::float8 AS total_fuel_cost,
            COALESCE(AVG(total_cost), 0)::float8 AS average_fuel_cost,
            COALESCE(AVG(price_per_unit), 0)::float8 AS average_fuel_price,
            COALESCE(AVG(CASE WHEN quantity > 0 THEN odometer / quantity ELSE 0 END), 0)::float8 AS average_fuel_efficiency
           FROM fuel_logs`,
        ),
        this.pool.query(`SELECT v.registration_number AS label, COALESCE(SUM(fl.total_cost), 0)::float8 AS value FROM fuel_logs fl INNER JOIN vehicles v ON v.id = fl.vehicle_id GROUP BY v.registration_number ORDER BY value DESC LIMIT 10`),
        this.pool.query(`SELECT COALESCE(u.full_name, 'Unassigned') AS label, COALESCE(SUM(fl.total_cost), 0)::float8 AS value FROM fuel_logs fl LEFT JOIN drivers d ON d.id = fl.driver_id LEFT JOIN users u ON u.id = d.user_id GROUP BY COALESCE(u.full_name, 'Unassigned') ORDER BY value DESC LIMIT 10`),
        this.pool.query(`SELECT COALESCE(city, 'Unknown') AS label, COALESCE(SUM(total_cost), 0)::float8 AS value FROM fuel_logs GROUP BY COALESCE(city, 'Unknown') ORDER BY value DESC LIMIT 10`),
        this.pool.query(`SELECT fuel_type AS label, COALESCE(SUM(total_cost), 0)::float8 AS value FROM fuel_logs GROUP BY fuel_type ORDER BY value DESC`),
        this.pool.query(`SELECT TO_CHAR(DATE_TRUNC('month', filled_at), 'YYYY-MM') AS label, COALESCE(SUM(total_cost), 0)::float8 AS value FROM fuel_logs GROUP BY DATE_TRUNC('month', filled_at) ORDER BY DATE_TRUNC('month', filled_at)`),
      ]);
      return {
        totals: totals.rows[0],
        charts: {
          fuel_cost_by_vehicle: byVehicle.rows,
          fuel_cost_by_driver: byDriver.rows,
          fuel_cost_by_city: byCity.rows,
          fuel_cost_by_fuel_type: byType.rows,
          monthly_fuel_trend: trend.rows,
        },
        insights: {
          highest_fuel_spending_vehicle: byVehicle.rows[0]?.label || "",
          lowest_fuel_spending_vehicle: byVehicle.rows[byVehicle.rows.length - 1]?.label || "",
        },
      };
    }

    const [financial, vehicles, trips, maintenance] = await Promise.all([
      this.pool.query(
        `SELECT
          COALESCE((SELECT SUM(total_cost) FROM fuel_logs), 0)::float8 AS fuel_cost,
          COALESCE((SELECT SUM(cost) FROM maintenance_records), 0)::float8 AS maintenance_cost,
          COALESCE((SELECT SUM(COALESCE(total_amount, amount + tax - discount)) FROM expenses WHERE category NOT IN ('fuel', 'maintenance')), 0)::float8 AS total_expenses,
          COALESCE((SELECT SUM(estimated_distance_km) FROM trips), 0)::float8 AS total_distance`,
      ),
      this.pool.query(`SELECT status AS label, COUNT(*)::int AS value FROM vehicles GROUP BY status ORDER BY status`),
      this.pool.query(`SELECT status AS label, COUNT(*)::int AS value FROM trips GROUP BY status ORDER BY status`),
      this.pool.query(`SELECT status AS label, COUNT(*)::int AS value FROM maintenance_records GROUP BY status ORDER BY status`),
    ]);
    const row = financial.rows[0];
    const operatingCost = Number(row.fuel_cost || 0) + Number(row.maintenance_cost || 0) + Number(row.total_expenses || 0);
    return {
      totals: {
        ...row,
        monthly_operating_cost: operatingCost,
        cost_per_kilometer: Number(row.total_distance || 0) > 0 ? operatingCost / Number(row.total_distance) : 0,
      },
      charts: {
        fleet_availability: vehicles.rows,
        trip_statistics: trips.rows,
        maintenance_statistics: maintenance.rows,
      },
      insights: {
        fleet_operating_cost: operatingCost,
        average_daily_operating_cost: operatingCost / 30,
        average_monthly_operating_cost: operatingCost,
      },
    };
  }

  private flattenForExport(report: { details: Array<Record<string, unknown>> }) {
    return report.details;
  }

  async generate(type: string, filters: Record<string, string | undefined>) {
    const format = normalizeFormat(filters.format);
    const result = await this.queryRows(type, filters);
    const rows = result.rows as Array<Record<string, unknown>>;
    const summary = await this.buildSummary(type, filters);
    const report = {
      report_type: type,
      report_name: this.reportTitle(type),
      generated_at: new Date().toISOString(),
      filters,
      details: rows,
      summary: summary.totals,
      analytics: summary.charts,
      insights: summary.insights,
    };

    await this.pool.query(
      `INSERT INTO report_history (report_type, report_name, filters, format)
       VALUES ($1,$2,$3,$4)`,
      [type, report.report_name, JSON.stringify(filters), format],
    );

    if (format === "csv") {
      const exportRows = this.flattenForExport(report);
      return {
        contentType: "text/csv",
        filename: `${type}-report.csv`,
        body: Buffer.from(toCsv(exportRows), "utf-8"),
      };
    }

    if (format === "pdf") {
      const lines = rows.map((row) => Object.values(row).join(" | "));
      return {
        contentType: "application/pdf",
        filename: `${type}-report.pdf`,
        body: createSimplePdf(this.reportTitle(type).toUpperCase(), lines),
      };
    }

    return {
      contentType: "application/json",
      filename: `${type}-report.json`,
      body: report,
    };
  }

  async listHistory() {
    const result = await this.pool.query(
      `SELECT id, report_type, report_name, filters, format, is_favorite, generated_at, generated_by
       FROM report_history
       ORDER BY generated_at DESC
       LIMIT 100`,
    );
    return result.rows;
  }

  async updateFavorite(id: string, isFavorite: boolean) {
    const result = await this.pool.query(
      `UPDATE report_history
       SET is_favorite = $2
       WHERE id = $1
       RETURNING id, report_type, report_name, filters, format, is_favorite, generated_at, generated_by`,
      [id, isFavorite],
    );
    return result.rows[0];
  }

  async deleteHistory(id: string) {
    await this.pool.query(`DELETE FROM report_history WHERE id = $1`, [id]);
    return { id };
  }
}
