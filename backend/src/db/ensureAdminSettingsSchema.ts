import { Pool } from "pg";

export async function ensureAdminSettingsSchema(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_name VARCHAR(255) NOT NULL DEFAULT 'TransitOps',
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      distance_unit VARCHAR(20) NOT NULL DEFAULT 'km',
      fuel_unit VARCHAR(20) NOT NULL DEFAULT 'liters',
      timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Calcutta',
      fuel_price_provider VARCHAR(100) NOT NULL DEFAULT 'manual',
      theme VARCHAR(50) NOT NULL DEFAULT 'system',
      notification_preferences JSONB NOT NULL DEFAULT '{"maintenance_due":true,"license_expiring":true,"insurance_expiring":true,"trip_delayed":true,"vehicle_offline":true}'::jsonb,
      application_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    INSERT INTO admin_settings (company_name)
    SELECT 'TransitOps'
    WHERE NOT EXISTS (SELECT 1 FROM admin_settings)
  `);
}
