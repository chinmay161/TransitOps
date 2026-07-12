import { Pool } from "pg";

const statements = [
  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_type
      WHERE typname = 'fuel_type'
    ) THEN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'other'
          AND enumtypid = 'fuel_type'::regtype
      ) THEN
        ALTER TYPE fuel_type ADD VALUE 'other';
      END IF;
    END IF;
  END $$;`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS driver_id UUID`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS fuel_station_name VARCHAR(255)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS fuel_station_address TEXT`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS city VARCHAR(100)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS state VARCHAR(100)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,6)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,6)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS fuel_type fuel_type`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS quantity NUMERIC(10,2)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS unit VARCHAR(20)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC(10,2)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS currency VARCHAR(10)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS odometer NUMERIC(10,2)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100)`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS receipt_image TEXT`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS remarks TEXT`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
  `ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
  `UPDATE fuel_logs
   SET
     fuel_type = COALESCE(fuel_logs.fuel_type, vehicles.fuel_type),
     quantity = COALESCE(quantity, liters),
     unit = COALESCE(unit, 'liters'),
     price_per_unit = COALESCE(price_per_unit, cost_per_liter),
     currency = COALESCE(currency, 'INR'),
     odometer = COALESCE(odometer, odometer_km),
     remarks = COALESCE(remarks, notes),
     fuel_station_name = COALESCE(fuel_station_name, 'Manual Entry'),
     payment_method = COALESCE(payment_method, 'cash')
   FROM vehicles
   WHERE vehicles.id = fuel_logs.vehicle_id
     AND (
       fuel_logs.fuel_type IS NULL
       OR quantity IS NULL
       OR unit IS NULL
       OR price_per_unit IS NULL
       OR currency IS NULL
       OR odometer IS NULL
       OR fuel_station_name IS NULL
       OR payment_method IS NULL
     )`,
  `UPDATE fuel_logs
   SET driver_id = trips.driver_id
   FROM trips
   WHERE fuel_logs.trip_id = trips.id
     AND fuel_logs.driver_id IS NULL`,
  `ALTER TABLE fuel_logs
    ADD CONSTRAINT fk_fuel_logs_driver
    FOREIGN KEY (driver_id) REFERENCES drivers (id) ON DELETE RESTRICT ON UPDATE CASCADE`,
  `CREATE INDEX IF NOT EXISTS idx_fuel_logs_driver_id ON fuel_logs (driver_id)`,
  `CREATE INDEX IF NOT EXISTS idx_fuel_logs_city ON fuel_logs (city)`,
  `CREATE INDEX IF NOT EXISTS idx_fuel_logs_state ON fuel_logs (state)`,
  `ALTER TABLE fuel_logs
    ADD CONSTRAINT ck_fuel_logs_quantity CHECK (COALESCE(quantity, 0) > 0)`,
  `ALTER TABLE fuel_logs
    ADD CONSTRAINT ck_fuel_logs_price_per_unit CHECK (COALESCE(price_per_unit, 0) > 0)`,
  `ALTER TABLE fuel_logs
    ADD CONSTRAINT ck_fuel_logs_odometer_new CHECK (COALESCE(odometer, 0) >= 0)`,
  `ALTER TABLE fuel_logs
    ADD CONSTRAINT ck_fuel_logs_unit CHECK (unit IN ('liters', 'gallons', 'kwh'))`,
  `ALTER TABLE fuel_logs
    ADD CONSTRAINT ck_fuel_logs_payment_method CHECK (payment_method IN ('cash', 'card', 'upi', 'fleet_card', 'other'))`,
];

async function runStatement(pool: Pool, statement: string) {
  try {
    await pool.query(statement);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (
      message.includes("already exists") ||
      message.includes("constraint") ||
      message.includes("duplicate")
    ) {
      return;
    }
    throw error;
  }
}

export async function ensureFuelLogSchema(pool: Pool) {
  for (const statement of statements) {
    await runStatement(pool, statement);
  }
}
