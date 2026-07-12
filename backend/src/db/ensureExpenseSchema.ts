import { Pool } from "pg";

const statements = [
  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_type
      WHERE typname = 'expense_category'
    ) THEN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'insurance'
          AND enumtypid = 'expense_category'::regtype
      ) THEN
        ALTER TYPE expense_category ADD VALUE 'insurance';
      END IF;
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'salary'
          AND enumtypid = 'expense_category'::regtype
      ) THEN
        ALTER TYPE expense_category ADD VALUE 'salary';
      END IF;
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'miscellaneous'
          AND enumtypid = 'expense_category'::regtype
      ) THEN
        ALTER TYPE expense_category ADD VALUE 'miscellaneous';
      END IF;
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'permit'
          AND enumtypid = 'expense_category'::regtype
      ) THEN
        ALTER TYPE expense_category ADD VALUE 'permit';
      END IF;
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'taxes'
          AND enumtypid = 'expense_category'::regtype
      ) THEN
        ALTER TYPE expense_category ADD VALUE 'taxes';
      END IF;
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'driver_allowance'
          AND enumtypid = 'expense_category'::regtype
      ) THEN
        ALTER TYPE expense_category ADD VALUE 'driver_allowance';
      END IF;
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'food'
          AND enumtypid = 'expense_category'::regtype
      ) THEN
        ALTER TYPE expense_category ADD VALUE 'food';
      END IF;
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'hotel'
          AND enumtypid = 'expense_category'::regtype
      ) THEN
        ALTER TYPE expense_category ADD VALUE 'hotel';
      END IF;
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'office_expenses'
          AND enumtypid = 'expense_category'::regtype
      ) THEN
        ALTER TYPE expense_category ADD VALUE 'office_expenses';
      END IF;
      IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'other'
          AND enumtypid = 'expense_category'::regtype
      ) THEN
        ALTER TYPE expense_category ADD VALUE 'other';
      END IF;
    END IF;
  END $$;`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS driver_id UUID`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255)`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vendor_contact VARCHAR(100)`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vendor_gst VARCHAR(100)`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100)`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100)`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_image TEXT`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vendor VARCHAR(255)`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30)`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tax NUMERIC(12,2) NOT NULL DEFAULT 0`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS discount NUMERIC(12,2) NOT NULL DEFAULT 0`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2)`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_by UUID`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_status VARCHAR(30) NOT NULL DEFAULT 'pending'`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS remarks TEXT`,
  `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS maintenance_id UUID`,
  `ALTER TABLE expenses
    ADD CONSTRAINT fk_expenses_driver
    FOREIGN KEY (driver_id) REFERENCES drivers (id) ON DELETE SET NULL ON UPDATE CASCADE`,
  `ALTER TABLE expenses
    ADD CONSTRAINT fk_expenses_approved_by
    FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE`,
  `ALTER TABLE expenses
    ADD CONSTRAINT fk_expenses_maintenance
    FOREIGN KEY (maintenance_id) REFERENCES maintenance_records (id) ON DELETE CASCADE`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_driver_id ON expenses (driver_id)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses (vendor)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_vendor_name ON expenses (vendor_name)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_invoice_number ON expenses (invoice_number)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses (expense_status)`,
  `CREATE INDEX IF NOT EXISTS idx_expenses_maintenance_id ON expenses (maintenance_id)`,
  `ALTER TABLE expenses
    ADD CONSTRAINT ck_expenses_payment_method CHECK (
      payment_method IS NULL OR payment_method IN ('cash', 'card', 'upi', 'fleet_card', 'bank_transfer', 'other')
    )`,
  `ALTER TABLE expenses
    ADD CONSTRAINT ck_expenses_tax CHECK (tax >= 0)`,
  `ALTER TABLE expenses
    ADD CONSTRAINT ck_expenses_discount CHECK (discount >= 0)`,
  `ALTER TABLE expenses
    ADD CONSTRAINT ck_expenses_total_amount CHECK (total_amount IS NULL OR total_amount >= 0)`,
  `ALTER TABLE expenses
    ADD CONSTRAINT ck_expenses_status CHECK (expense_status IN ('pending', 'approved', 'rejected', 'paid'))`,
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

export async function ensureExpenseSchema(pool: Pool) {
  for (const statement of statements) {
    await runStatement(pool, statement);
  }
}
