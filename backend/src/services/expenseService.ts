import { Pool } from "pg";
import { ExpensePayload, expenseCategories, expensePaymentMethods, expenseStatuses } from "../types/expense";
import { ApiError } from "../utils/api";
import { recordAuditLog } from "../utils/auditLog";

function normalizeText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function ensurePositiveAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(422, "Amount must be greater than 0.");
  }
  return amount;
}

function ensureNonNegative(value: unknown, field: string) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ApiError(422, `${field} must be 0 or greater.`);
  }
  return amount;
}

function ensureDate(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new ApiError(422, "Expense date is required and must be valid.");
  }
  return new Date(parsed).toISOString().slice(0, 10);
}

function validateEnum<T extends readonly string[]>(value: string, allowed: T, field: string): T[number] {
  const normalized = value.toLowerCase();
  if (!allowed.includes(normalized)) {
    throw new ApiError(422, `${field} must be one of: ${allowed.join(", ")}.`);
  }
  return normalized as T[number];
}

export class ExpenseService {
  constructor(private readonly pool: Pool) {}

  async getMetadata() {
    const [vehicles, drivers, trips, approvers] = await Promise.all([
      this.pool.query(
        `SELECT id, registration_number, CONCAT(make, ' ', model) AS vehicle_name
         FROM vehicles
         ORDER BY registration_number ASC`,
      ),
      this.pool.query(
        `SELECT d.id, u.full_name
         FROM drivers d
         INNER JOIN users u ON u.id = d.user_id
         ORDER BY u.full_name ASC`,
      ),
      this.pool.query(
        `SELECT id, origin, destination
         FROM trips
         ORDER BY scheduled_start DESC
         LIMIT 100`,
      ),
      this.pool.query(
        `SELECT id, full_name, role
         FROM users
         WHERE role IN ('admin', 'fleet_manager', 'dispatcher')
         ORDER BY full_name ASC`,
      ),
    ]);

    return {
      vehicles: vehicles.rows,
      drivers: drivers.rows,
      trips: trips.rows,
      categories: expenseCategories,
      payment_methods: expensePaymentMethods,
      statuses: expenseStatuses,
      approvers: approvers.rows,
    };
  }

  async getSummary(query: Record<string, string | undefined>) {
    const { whereClause, values } = this.buildFilters(query);
    const [summaryResult, trendResult, categoryResult, vehicleResult, driverResult, vendorResult] = await Promise.all([
      this.pool.query(
        `SELECT
          COUNT(*)::int AS total_expense_records,
          COALESCE(SUM(e.amount), 0)::float8 AS base_amount,
          COALESCE(SUM(e.tax), 0)::float8 AS total_tax,
          COALESCE(SUM(e.discount), 0)::float8 AS total_discount,
          COALESCE(SUM(COALESCE(e.total_amount, e.amount + e.tax - e.discount)), 0)::float8 AS total_amount,
          COALESCE(SUM(COALESCE(e.total_amount, e.amount + e.tax - e.discount)) FILTER (WHERE e.expense_status = 'pending'), 0)::float8 AS pending_amount,
          COALESCE(SUM(COALESCE(e.total_amount, e.amount + e.tax - e.discount)) FILTER (WHERE e.expense_status = 'approved'), 0)::float8 AS approved_amount,
          COALESCE(SUM(COALESCE(e.total_amount, e.amount + e.tax - e.discount)) FILTER (WHERE e.expense_status = 'paid'), 0)::float8 AS paid_amount
         FROM expenses e
         INNER JOIN vehicles v ON v.id = e.vehicle_id
         LEFT JOIN drivers d ON d.id = e.driver_id
         LEFT JOIN users u ON u.id = d.user_id
         ${whereClause}`,
        values,
      ),
      this.pool.query(
        `SELECT
          TO_CHAR(DATE_TRUNC('month', e.expense_date), 'YYYY-MM') AS label,
          COALESCE(SUM(COALESCE(e.total_amount, e.amount + e.tax - e.discount)), 0)::float8 AS value
         FROM expenses e
         INNER JOIN vehicles v ON v.id = e.vehicle_id
         LEFT JOIN drivers d ON d.id = e.driver_id
         LEFT JOIN users u ON u.id = d.user_id
         ${whereClause}
         GROUP BY DATE_TRUNC('month', e.expense_date)
         ORDER BY DATE_TRUNC('month', e.expense_date) ASC`,
        values,
      ),
      this.pool.query(
        `SELECT e.category AS label, COALESCE(SUM(COALESCE(e.total_amount, e.amount + e.tax - e.discount)), 0)::float8 AS value
         FROM expenses e
         INNER JOIN vehicles v ON v.id = e.vehicle_id
         LEFT JOIN drivers d ON d.id = e.driver_id
         LEFT JOIN users u ON u.id = d.user_id
         ${whereClause}
         GROUP BY e.category
         ORDER BY value DESC, label ASC`,
        values,
      ),
      this.pool.query(
        `SELECT v.registration_number AS label, COALESCE(SUM(COALESCE(e.total_amount, e.amount + e.tax - e.discount)), 0)::float8 AS value
         FROM expenses e
         INNER JOIN vehicles v ON v.id = e.vehicle_id
         LEFT JOIN drivers d ON d.id = e.driver_id
         LEFT JOIN users u ON u.id = d.user_id
         ${whereClause}
         GROUP BY v.registration_number
         ORDER BY value DESC, label ASC
         LIMIT 10`,
        values,
      ),
      this.pool.query(
        `SELECT COALESCE(u.full_name, 'Unassigned') AS label, COALESCE(SUM(COALESCE(e.total_amount, e.amount + e.tax - e.discount)), 0)::float8 AS value
         FROM expenses e
         INNER JOIN vehicles v ON v.id = e.vehicle_id
         LEFT JOIN drivers d ON d.id = e.driver_id
         LEFT JOIN users u ON u.id = d.user_id
         ${whereClause}
         GROUP BY COALESCE(u.full_name, 'Unassigned')
         ORDER BY value DESC, label ASC
         LIMIT 10`,
        values,
      ),
      this.pool.query(
        `SELECT COALESCE(e.vendor_name, e.vendor, 'Unknown Vendor') AS label, COALESCE(SUM(COALESCE(e.total_amount, e.amount + e.tax - e.discount)), 0)::float8 AS value
         FROM expenses e
         INNER JOIN vehicles v ON v.id = e.vehicle_id
         LEFT JOIN drivers d ON d.id = e.driver_id
         LEFT JOIN users u ON u.id = d.user_id
         ${whereClause}
         GROUP BY COALESCE(e.vendor_name, e.vendor, 'Unknown Vendor')
         ORDER BY value DESC, label ASC
         LIMIT 10`,
        values,
      ),
    ]);

    return {
      summary: summaryResult.rows[0],
      monthly_trend: trendResult.rows,
      by_category: categoryResult.rows,
      by_vehicle: vehicleResult.rows,
      by_driver: driverResult.rows,
      top_vendors: vendorResult.rows,
    };
  }

  private buildFilters(query: Record<string, string | undefined>) {
    const values: Array<string | number> = [];
    const filters: string[] = [];

    if (query.vehicle_id) {
      values.push(query.vehicle_id);
      filters.push(`e.vehicle_id = $${values.length}`);
    }
    if (query.driver_id) {
      values.push(query.driver_id);
      filters.push(`e.driver_id = $${values.length}`);
    }
    if (query.trip_id) {
      values.push(query.trip_id);
      filters.push(`e.trip_id = $${values.length}`);
    }
    const category = query.expense_category || query.category;
    if (category) {
      values.push(category);
      filters.push(`e.category = $${values.length}`);
    }
    if (query.vendor || query.vendor_name) {
      values.push(`%${query.vendor || query.vendor_name}%`);
      filters.push(`(COALESCE(e.vendor_name, e.vendor, '') ILIKE $${values.length})`);
    }
    if (query.payment_method) {
      values.push(query.payment_method);
      filters.push(`e.payment_method = $${values.length}`);
    }
    if (query.status || query.expense_status) {
      values.push(query.status || query.expense_status || "");
      filters.push(`e.expense_status = $${values.length}`);
    }
    if (query.date_from) {
      values.push(query.date_from);
      filters.push(`e.expense_date >= $${values.length}`);
    }
    if (query.date_to) {
      values.push(query.date_to);
      filters.push(`e.expense_date <= $${values.length}`);
    }
    if (query.q) {
      values.push(`%${query.q}%`);
      filters.push(`(
        v.registration_number ILIKE $${values.length}
        OR COALESCE(u.full_name, '') ILIKE $${values.length}
        OR COALESCE(e.vendor_name, e.vendor, '') ILIKE $${values.length}
        OR COALESCE(e.invoice_number, '') ILIKE $${values.length}
        OR COALESCE(e.receipt_number, '') ILIKE $${values.length}
      )`);
    }

    return {
      whereClause: filters.length ? `WHERE ${filters.join(" AND ")}` : "",
      values,
    };
  }

  async listExpenses(query: Record<string, string | undefined>) {
    const { whereClause, values } = this.buildFilters(query);
    const result = await this.pool.query(
      `SELECT
        e.id,
        e.vehicle_id,
        e.driver_id,
        e.trip_id,
        e.category,
        e.category AS expense_category,
        e.amount::float8 AS amount,
        e.tax::float8 AS tax,
        e.discount::float8 AS discount,
        COALESCE(e.total_amount, e.amount + e.tax - e.discount)::float8 AS total_amount,
        e.description,
        e.vendor_name,
        e.vendor_contact,
        e.vendor_gst,
        e.invoice_number,
        e.receipt_number,
        e.receipt_image,
        e.vendor,
        e.payment_method,
        e.approved_by,
        approver.full_name AS approved_by_name,
        e.approved_at,
        e.expense_status,
        e.remarks,
        TO_CHAR(e.expense_date, 'YYYY-MM-DD') AS expense_date,
        e.created_at,
        e.updated_at,
        v.registration_number,
        CONCAT(v.make, ' ', v.model) AS vehicle_name,
        u.full_name AS driver_name,
        t.origin,
        t.destination
      FROM expenses e
      INNER JOIN vehicles v ON v.id = e.vehicle_id
      LEFT JOIN drivers d ON d.id = e.driver_id
      LEFT JOIN users u ON u.id = d.user_id
      LEFT JOIN users approver ON approver.id = e.approved_by
      LEFT JOIN trips t ON t.id = e.trip_id
      ${whereClause}
      ORDER BY e.expense_date DESC, e.created_at DESC`,
      values,
    );

    return result.rows;
  }

  async getExpenseById(id: string) {
    const result = await this.pool.query(
      `SELECT
        e.id,
        e.vehicle_id,
        e.driver_id,
        e.trip_id,
        e.category,
        e.category AS expense_category,
        e.amount::float8 AS amount,
        e.tax::float8 AS tax,
        e.discount::float8 AS discount,
        COALESCE(e.total_amount, e.amount + e.tax - e.discount)::float8 AS total_amount,
        e.description,
        e.vendor_name,
        e.vendor_contact,
        e.vendor_gst,
        e.invoice_number,
        e.receipt_number,
        e.receipt_image,
        e.vendor,
        e.payment_method,
        e.approved_by,
        approver.full_name AS approved_by_name,
        e.approved_at,
        e.expense_status,
        e.remarks,
        TO_CHAR(e.expense_date, 'YYYY-MM-DD') AS expense_date,
        e.created_at,
        e.updated_at,
        v.registration_number,
        CONCAT(v.make, ' ', v.model) AS vehicle_name,
        u.full_name AS driver_name,
        t.origin,
        t.destination
      FROM expenses e
      INNER JOIN vehicles v ON v.id = e.vehicle_id
      LEFT JOIN drivers d ON d.id = e.driver_id
      LEFT JOIN users u ON u.id = d.user_id
      LEFT JOIN users approver ON approver.id = e.approved_by
      LEFT JOIN trips t ON t.id = e.trip_id
      WHERE e.id = $1`,
      [id],
    );

    if (!result.rowCount) {
      throw new ApiError(404, "Expense not found.");
    }
    return result.rows[0];
  }

  private async validateRelations(payload: ExpensePayload) {
    const vehicleResult = await this.pool.query(`SELECT id FROM vehicles WHERE id = $1`, [payload.vehicle_id]);
    if (!vehicleResult.rowCount) {
      throw new ApiError(404, "Selected vehicle does not exist.");
    }

    if (payload.driver_id) {
      const driverResult = await this.pool.query(`SELECT id FROM drivers WHERE id = $1`, [payload.driver_id]);
      if (!driverResult.rowCount) {
        throw new ApiError(404, "Selected driver does not exist.");
      }
    }

    if (payload.trip_id) {
      const tripResult = await this.pool.query(
        `SELECT id, vehicle_id FROM trips WHERE id = $1`,
        [payload.trip_id],
      );
      if (!tripResult.rowCount) {
        throw new ApiError(404, "Selected trip does not exist.");
      }
      if (tripResult.rows[0].vehicle_id !== payload.vehicle_id) {
        throw new ApiError(422, "Selected trip does not belong to the selected vehicle.");
      }
    }

    if (payload.approved_by) {
      const approverResult = await this.pool.query(`SELECT id FROM users WHERE id = $1`, [payload.approved_by]);
      if (!approverResult.rowCount) {
        throw new ApiError(404, "Selected approver does not exist.");
      }
    }
  }

  private mapPayload(payload: ExpensePayload) {
    if (!payload.vehicle_id?.trim()) {
      throw new ApiError(422, "Vehicle is required.");
    }

    const category = payload.expense_category || payload.category;
    if (!category) {
      throw new ApiError(422, "Category is required.");
    }
    if (!payload.payment_method) {
      throw new ApiError(422, "Payment method is required.");
    }

    const amount = ensurePositiveAmount(payload.amount);
    const tax = ensureNonNegative(payload.tax, "Tax");
    const discount = ensureNonNegative(payload.discount, "Discount");
    const totalAmount = payload.total_amount !== undefined && payload.total_amount !== null
      ? ensureNonNegative(payload.total_amount, "Total amount")
      : Number((amount + tax - discount).toFixed(2));

    return {
      vehicle_id: payload.vehicle_id.trim(),
      driver_id: payload.driver_id?.trim() || null,
      trip_id: payload.trip_id?.trim() || null,
      category: validateEnum(category, expenseCategories, "Category"),
      amount,
      tax,
      discount,
      total_amount: totalAmount,
      description: normalizeText(payload.description),
      vendor_name: normalizeText(payload.vendor_name || payload.vendor),
      vendor_contact: normalizeText(payload.vendor_contact),
      vendor_gst: normalizeText(payload.vendor_gst),
      invoice_number: normalizeText(payload.invoice_number),
      receipt_number: normalizeText(payload.receipt_number),
      receipt_image: normalizeText(payload.receipt_image),
      vendor: normalizeText(payload.vendor || payload.vendor_name),
      payment_method: payload.payment_method
        ? validateEnum(payload.payment_method, expensePaymentMethods, "Payment method")
        : null,
      expense_date: ensureDate(payload.expense_date),
      approved_by: payload.approved_by?.trim() || null,
      approved_at: payload.approved_at ? new Date(payload.approved_at).toISOString() : null,
      expense_status: payload.expense_status
        ? validateEnum(payload.expense_status, expenseStatuses, "Expense status")
        : "pending",
      remarks: normalizeText(payload.remarks),
      created_by: payload.created_by?.trim() || null,
    };
  }

  async createExpense(payload: ExpensePayload) {
    const mapped = this.mapPayload(payload);
    await this.validateRelations(mapped);

    const result = await this.pool.query(
      `INSERT INTO expenses (
        vehicle_id,
        driver_id,
        trip_id,
        category,
        vendor_name,
        vendor_contact,
        vendor_gst,
        invoice_number,
        receipt_number,
        receipt_image,
        description,
        payment_method,
        amount,
        tax,
        discount,
        total_amount,
        vendor,
        expense_date,
        approved_by,
        approved_at,
        expense_status,
        remarks,
        created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      RETURNING id`,
      [
        mapped.vehicle_id,
        mapped.driver_id,
        mapped.trip_id,
        mapped.category,
        mapped.vendor_name,
        mapped.vendor_contact,
        mapped.vendor_gst,
        mapped.invoice_number,
        mapped.receipt_number,
        mapped.receipt_image,
        mapped.description,
        mapped.payment_method,
        mapped.amount,
        mapped.tax,
        mapped.discount,
        mapped.total_amount,
        mapped.vendor,
        mapped.expense_date,
        mapped.approved_by,
        mapped.approved_at,
        mapped.expense_status,
        mapped.remarks,
        mapped.created_by,
      ],
    );

    const created = await this.getExpenseById(result.rows[0].id);
    await recordAuditLog(this.pool, {
      actor_id: mapped.created_by,
      module_name: "expenses",
      entity_type: "expense",
      entity_id: created.id,
      action_name: "create",
      new_value: created,
    });
    return created;
  }

  async updateExpense(id: string, payload: ExpensePayload) {
    const before = await this.getExpenseById(id);
    const mapped = this.mapPayload(payload);
    await this.validateRelations(mapped);

    await this.pool.query(
      `UPDATE expenses
       SET
         vehicle_id = $2,
         driver_id = $3,
         trip_id = $4,
         category = $5,
         vendor_name = $6,
         vendor_contact = $7,
         vendor_gst = $8,
         invoice_number = $9,
         receipt_number = $10,
         receipt_image = $11,
         description = $12,
         payment_method = $13,
         amount = $14,
         tax = $15,
         discount = $16,
         total_amount = $17,
         vendor = $18,
         expense_date = $19,
         approved_by = $20,
         approved_at = $21,
         expense_status = $22,
         remarks = $23,
         updated_at = now()
       WHERE id = $1`,
      [
        id,
        mapped.vehicle_id,
        mapped.driver_id,
        mapped.trip_id,
        mapped.category,
        mapped.vendor_name,
        mapped.vendor_contact,
        mapped.vendor_gst,
        mapped.invoice_number,
        mapped.receipt_number,
        mapped.receipt_image,
        mapped.description,
        mapped.payment_method,
        mapped.amount,
        mapped.tax,
        mapped.discount,
        mapped.total_amount,
        mapped.vendor,
        mapped.expense_date,
        mapped.approved_by,
        mapped.approved_at,
        mapped.expense_status,
        mapped.remarks,
      ],
    );

    const updated = await this.getExpenseById(id);
    await recordAuditLog(this.pool, {
      actor_id: mapped.created_by,
      module_name: "expenses",
      entity_type: "expense",
      entity_id: id,
      action_name: "update",
      old_value: before,
      new_value: updated,
    });
    return updated;
  }

  async listApprovals(query: Record<string, string | undefined>) {
    return this.listExpenses({ ...query, expense_status: query.expense_status || "pending" });
  }

  async updateExpenseStatus(id: string, payload: { expense_status: string; approved_by?: string; remarks?: string }) {
    const before = await this.getExpenseById(id);
    const status = validateEnum(payload.expense_status, expenseStatuses, "Expense status");
    const approvedBy = payload.approved_by?.trim() || null;
    if ((status === "approved" || status === "paid") && !approvedBy) {
      throw new ApiError(422, "approved_by is required when approving or paying an expense.");
    }

    await this.pool.query(
      `UPDATE expenses
       SET
         expense_status = $2,
         approved_by = CASE WHEN $2 IN ('approved', 'paid') THEN $3 ELSE approved_by END,
         approved_at = CASE WHEN $2 IN ('approved', 'paid') THEN now() ELSE approved_at END,
         remarks = COALESCE($4, remarks),
         updated_at = now()
       WHERE id = $1`,
      [id, status, approvedBy, payload.remarks?.trim() || null],
    );

    const updated = await this.getExpenseById(id);
    const recipient = await this.resolveExpenseNotificationRecipient(id);
    if (recipient && (status === "approved" || status === "rejected")) {
      await this.pool.query(
        `INSERT INTO notifications (user_id, title, message, status, notification_type, entity_type, entity_id)
         VALUES ($1,$2,$3,'unread',$4,'expense',$5)`,
        [
          recipient,
          status === "approved" ? "Expense Approved" : "Expense Rejected",
          `Expense ${updated.receipt_number || updated.id} has been ${status}.`,
          status === "approved" ? "expense_approved" : "expense_rejected",
          id,
        ],
      );
    }

    await recordAuditLog(this.pool, {
      actor_id: approvedBy,
      module_name: "expenses",
      entity_type: "expense",
      entity_id: id,
      action_name: `status_${status}`,
      old_value: before,
      new_value: updated,
    });
    return updated;
  }

  async deleteExpense(id: string) {
    const before = await this.getExpenseById(id);
    const result = await this.pool.query(`DELETE FROM expenses WHERE id = $1 RETURNING id`, [id]);
    if (!result.rowCount) {
      throw new ApiError(404, "Expense not found.");
    }
    await recordAuditLog(this.pool, {
      module_name: "expenses",
      entity_type: "expense",
      entity_id: id,
      action_name: "delete",
      old_value: before,
    });
    return { id };
  }

  private async resolveExpenseNotificationRecipient(id: string) {
    const result = await this.pool.query(
      `SELECT COALESCE(e.created_by, d.user_id) AS recipient_id
       FROM expenses e
       LEFT JOIN drivers d ON d.id = e.driver_id
       WHERE e.id = $1`,
      [id],
    );

    return result.rows[0]?.recipient_id || null;
  }
}
