import { Pool } from "pg";

interface AuditLogEntry {
  actor_id?: string | null;
  module_name: string;
  entity_type: string;
  entity_id?: string | null;
  action_name: string;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
}

export async function recordAuditLog(pool: Pool, entry: AuditLogEntry) {
  await pool.query(
    `INSERT INTO audit_logs (
      actor_id,
      module_name,
      entity_type,
      entity_id,
      action_name,
      old_value,
      new_value
    ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      entry.actor_id || null,
      entry.module_name,
      entry.entity_type,
      entry.entity_id || null,
      entry.action_name,
      entry.old_value ? JSON.stringify(entry.old_value) : null,
      entry.new_value ? JSON.stringify(entry.new_value) : null,
    ],
  );
}
