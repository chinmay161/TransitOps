import { Pool } from "pg";
import { AdminSettingsPayload } from "../types/adminSettings";
import { recordAuditLog } from "../utils/auditLog";

export class AdminSettingsService {
  constructor(private readonly pool: Pool) {}

  async getSettings() {
    const [settings, auditLogs] = await Promise.all([
      this.pool.query(`SELECT * FROM admin_settings ORDER BY created_at ASC LIMIT 1`),
      this.pool.query(
        `SELECT id, actor_id, module_name, entity_type, entity_id, action_name, old_value, new_value, created_at
         FROM audit_logs
         WHERE module_name = 'admin_settings'
         ORDER BY created_at DESC
         LIMIT 25`,
      ),
    ]);
    return {
      ...settings.rows[0],
      audit_logs: auditLogs.rows,
    };
  }

  async updateSettings(payload: AdminSettingsPayload) {
    const before = await this.getSettings();
    await this.pool.query(
      `UPDATE admin_settings
       SET
         company_name = COALESCE($1, company_name),
         company_logo = COALESCE($2, company_logo),
         currency = COALESCE($3, currency),
         distance_unit = COALESCE($4, distance_unit),
         fuel_unit = COALESCE($5, fuel_unit),
         timezone = COALESCE($6, timezone),
         language = COALESCE($7, language),
         fuel_price_provider = COALESCE($8, fuel_price_provider),
         theme = COALESCE($9, theme),
         notification_preferences = COALESCE($10, notification_preferences),
         email_settings = COALESCE($11, email_settings),
         role_permissions = COALESCE($12, role_permissions),
         application_version = COALESCE($13, application_version),
         updated_at = now()`,
      [
        payload.company_name || null,
        payload.company_logo || null,
        payload.currency || null,
        payload.distance_unit || null,
        payload.fuel_unit || null,
        payload.timezone || null,
        payload.language || null,
        payload.fuel_price_provider || null,
        payload.theme || null,
        payload.notification_preferences ? JSON.stringify(payload.notification_preferences) : null,
        payload.email_settings ? JSON.stringify(payload.email_settings) : null,
        payload.role_permissions ? JSON.stringify(payload.role_permissions) : null,
        payload.application_version || null,
      ],
    );

    const updated = await this.getSettings();
    await recordAuditLog(this.pool, {
      module_name: "admin_settings",
      entity_type: "admin_settings",
      entity_id: updated.id,
      action_name: "update",
      old_value: before,
      new_value: updated,
    });
    return updated;
  }

  async listAuditLogs() {
    const result = await this.pool.query(
      `SELECT id, actor_id, module_name, entity_type, entity_id, action_name, old_value, new_value, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 100`,
    );
    return result.rows;
  }
}
