import { Pool } from "pg";

const statements = [
  `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_type VARCHAR(100) NOT NULL DEFAULT 'system'`,
  `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100)`,
  `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_id UUID`,
  `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ`,
  `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (notification_type)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_deleted_at ON notifications (deleted_at)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID`,
  `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) NOT NULL DEFAULT 'pending'`,
  `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_source VARCHAR(100)`,
  `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ`,
  `ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_id VARCHAR(100)`,
  `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS company_logo TEXT`,
  `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS language VARCHAR(30) NOT NULL DEFAULT 'en'`,
  `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS email_settings JSONB NOT NULL DEFAULT '{"provider":"smtp","from_email":"","from_name":"TransitOps","smtp_host":"","smtp_port":587,"smtp_secure":false,"smtp_username":"","smtp_password":"","reply_to":""}'::jsonb`,
  `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS role_permissions JSONB NOT NULL DEFAULT '{"admin":["all"],"fleet_manager":["dashboard","vehicles","drivers","trips","maintenance","fuel_logs","expenses","reports","notifications"],"dispatcher":["dashboard","trips","notifications"],"driver":["dashboard","fuel_logs","expenses","notifications"]}'::jsonb`,
  `CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_id UUID,
      module_name VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id UUID,
      action_name VARCHAR(100) NOT NULL,
      old_value JSONB,
      new_value JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_module_name ON audit_logs (module_name, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs (entity_type, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS report_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_type VARCHAR(100) NOT NULL,
      report_name VARCHAR(255) NOT NULL,
      filters JSONB NOT NULL DEFAULT '{}'::jsonb,
      format VARCHAR(20) NOT NULL DEFAULT 'json',
      is_favorite BOOLEAN NOT NULL DEFAULT false,
      generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      generated_by UUID
    )`,
  `CREATE INDEX IF NOT EXISTS idx_report_history_type ON report_history (report_type, generated_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_report_history_favorite ON report_history (is_favorite, generated_at DESC)`,
];

async function runStatement(pool: Pool, statement: string) {
  try {
    await pool.query(statement);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("already exists") || message.includes("duplicate")) {
      return;
    }
    throw error;
  }
}

export async function ensureEnterpriseOpsSchema(pool: Pool) {
  for (const statement of statements) {
    await runStatement(pool, statement);
  }
}
