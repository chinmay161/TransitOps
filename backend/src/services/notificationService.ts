import { Pool } from "pg";
import { ApiError } from "../utils/api";

const notificationTypes = [
  "trip_assigned",
  "trip_delayed",
  "trip_completed",
  "maintenance_due",
  "maintenance_completed",
  "license_expiring",
  "insurance_expiring",
  "vehicle_offline",
  "fuel_price_failure",
  "expense_approved",
  "expense_rejected",
  "system",
] as const;

function normalizeType(value?: string) {
  if (!value) return "system";
  const normalized = value.toLowerCase();
  if (!notificationTypes.includes(normalized as (typeof notificationTypes)[number])) {
    throw new ApiError(422, `Notification type must be one of: ${notificationTypes.join(", ")}.`);
  }
  return normalized;
}

export class NotificationService {
  constructor(private readonly pool: Pool) {}

  async listNotifications(query: Record<string, string | undefined> = {}) {
    const [stored, maintenanceDue, maintenanceCompleted, insuranceExpiring, licenseExpiring, tripDelayed, tripCompleted, vehicleOffline, unreadCount] =
      await Promise.all([
        this.pool.query(
          `SELECT id, user_id, title, message, status, notification_type, entity_type, entity_id, read_at, created_at, updated_at
           FROM notifications
           WHERE deleted_at IS NULL
             AND ($1::text IS NULL OR status = $1)
             AND ($2::text IS NULL OR notification_type = $2)
           ORDER BY created_at DESC
           LIMIT 100`,
          [query.status || null, query.notification_type || null],
        ),
        this.pool.query(
          `SELECT m.id, m.vehicle_id, v.registration_number, m.type, m.scheduled_date
           FROM maintenance_records m
           INNER JOIN vehicles v ON v.id = m.vehicle_id
           WHERE status IN ('scheduled', 'in_progress')
             AND scheduled_date <= CURRENT_DATE + INTERVAL '7 days'
           ORDER BY scheduled_date ASC
           LIMIT 10`,
        ),
        this.pool.query(
          `SELECT m.id, m.vehicle_id, v.registration_number, m.type, m.completed_date
           FROM maintenance_records m
           INNER JOIN vehicles v ON v.id = m.vehicle_id
           WHERE m.status = 'completed'
             AND m.completed_date >= CURRENT_DATE - INTERVAL '7 days'
           ORDER BY m.completed_date DESC
           LIMIT 10`,
        ),
        this.pool.query(
          `SELECT id, registration_number, insurance_expiry
           FROM vehicles
           WHERE insurance_expiry IS NOT NULL
             AND insurance_expiry <= CURRENT_DATE + INTERVAL '30 days'
           ORDER BY insurance_expiry ASC
           LIMIT 10`,
        ),
        this.pool.query(
          `SELECT d.id, u.full_name, d.license_expiry
           FROM drivers d
           INNER JOIN users u ON u.id = d.user_id
           WHERE d.license_expiry <= CURRENT_DATE + INTERVAL '30 days'
           ORDER BY d.license_expiry ASC
           LIMIT 10`,
        ),
        this.pool.query(
          `SELECT id, origin, destination, scheduled_end
           FROM trips
           WHERE (status = 'in_progress' AND scheduled_end < NOW())
              OR (status = 'completed' AND actual_end IS NOT NULL AND actual_end > scheduled_end)
           ORDER BY scheduled_end ASC
           LIMIT 10`,
        ),
        this.pool.query(
          `SELECT id, origin, destination, actual_end
           FROM trips
           WHERE status = 'completed'
             AND actual_end >= NOW() - INTERVAL '7 days'
           ORDER BY actual_end DESC
           LIMIT 10`,
        ),
        this.pool.query(
          `SELECT id, registration_number, status
           FROM vehicles
           WHERE status = 'inactive'
           ORDER BY updated_at DESC
           LIMIT 10`,
        ),
        this.pool.query(
          `SELECT COUNT(*)::int AS unread_count
           FROM notifications
           WHERE status = 'unread'
             AND deleted_at IS NULL`,
        ),
      ]);

    return {
      unread_count: unreadCount.rows[0]?.unread_count || 0,
      types: notificationTypes,
      history: stored.rows,
      maintenance_due: maintenanceDue.rows,
      maintenance_completed: maintenanceCompleted.rows,
      insurance_expiring: insuranceExpiring.rows,
      license_expiring: licenseExpiring.rows,
      trip_delayed: tripDelayed.rows,
      trip_completed: tripCompleted.rows,
      vehicle_offline: vehicleOffline.rows,
    };
  }

  async getNotificationById(id: string) {
    const result = await this.pool.query(
      `SELECT id, user_id, title, message, status, notification_type, entity_type, entity_id, read_at, created_at, updated_at
       FROM notifications
       WHERE id = $1
         AND deleted_at IS NULL`,
      [id],
    );
    if (!result.rowCount) {
      throw new ApiError(404, "Notification not found.");
    }
    return result.rows[0];
  }

  async createNotification(payload: Record<string, string | undefined>) {
    if (!payload.user_id) throw new ApiError(422, "user_id is required.");
    if (!payload.title?.trim()) throw new ApiError(422, "title is required.");
    if (!payload.message?.trim()) throw new ApiError(422, "message is required.");

    const userResult = await this.pool.query(`SELECT id FROM users WHERE id = $1`, [payload.user_id]);
    if (!userResult.rowCount) {
      throw new ApiError(404, "User not found.");
    }

    const result = await this.pool.query(
      `INSERT INTO notifications (user_id, title, message, notification_type, entity_type, entity_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      [
        payload.user_id,
        payload.title.trim(),
        payload.message.trim(),
        normalizeType(payload.notification_type),
        payload.entity_type?.trim() || null,
        payload.entity_id?.trim() || null,
      ],
    );
    return this.getNotificationById(result.rows[0].id);
  }

  async markAsRead(id: string) {
    const result = await this.pool.query(
      `UPDATE notifications
       SET status = 'read', read_at = COALESCE(read_at, now()), updated_at = now()
       WHERE id = $1
         AND deleted_at IS NULL
       RETURNING id, title, message, status, notification_type, read_at, created_at, updated_at`,
      [id],
    );

    if (!result.rowCount) {
      throw new ApiError(404, "Notification not found.");
    }
    return result.rows[0];
  }

  async markAllAsRead() {
    const result = await this.pool.query(
      `UPDATE notifications
       SET status = 'read', read_at = COALESCE(read_at, now()), updated_at = now()
       WHERE status = 'unread'
         AND deleted_at IS NULL
       RETURNING id`,
    );
    return { updated_count: result.rowCount || 0 };
  }

  async deleteNotification(id: string) {
    const result = await this.pool.query(
      `UPDATE notifications
       SET deleted_at = now(), updated_at = now()
       WHERE id = $1
         AND deleted_at IS NULL
       RETURNING id`,
      [id],
    );
    if (!result.rowCount) {
      throw new ApiError(404, "Notification not found.");
    }
    return { id };
  }
}
