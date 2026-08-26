import { Pool } from "pg";

// Additive Better Auth schema. Never recreates or destroys existing data:
// - Extends user_role ENUM with the safe onboarding role 'pending'.
// - Adds the Better Auth-managed `sessions`, `accounts`, and `verifications`
//   tables keyed to the existing users.id so all TransitOps foreign keys
//   remain valid.
// - users.password_hash is only relaxed when that legacy column exists;
//   databases without the column are left untouched.
const statements = [
  `ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'pending'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT`,
  // Some deployed databases predate the password_hash column entirely
  // (Google-only auth needs no passwords), so relax the constraint only
  // when the legacy column actually exists.
  `DO $$
   BEGIN
     IF EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'password_hash'
     ) THEN
       ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
     END IF;
   END $$;`,
  `CREATE TABLE IF NOT EXISTS sessions (
      id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id       UUID        NOT NULL,
      token         TEXT        NOT NULL UNIQUE,
      expires_at    TIMESTAMPTZ NOT NULL,
      ip_address    TEXT,
      user_agent    TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
          REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
    )`,
  `ALTER TABLE sessions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at)`,
  `CREATE TABLE IF NOT EXISTS accounts (
      id                        TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id                   UUID        NOT NULL,
      account_id                TEXT        NOT NULL,
      issuer                    TEXT        NOT NULL DEFAULT '',
      provider_id               TEXT        NOT NULL,
      access_token              TEXT,
      refresh_token             TEXT,
      id_token                  TEXT,
      access_token_expires_at   TIMESTAMPTZ,
      refresh_token_expires_at  TIMESTAMPTZ,
      scope                     TEXT,
      password                  TEXT,
      created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_accounts_user FOREIGN KEY (user_id)
          REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
    )`,
  // Better Auth >= 1.7 scopes each OAuth identity by issuer. Tables created
  // before 1.7 lack the column; backfill legacy rows from provider_id before
  // enforcing NOT NULL so no data is lost.
  `DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'accounts' AND column_name = 'issuer'
     ) THEN
       ALTER TABLE accounts ADD COLUMN issuer TEXT;
       UPDATE accounts SET issuer = '' WHERE issuer IS NULL;
       ALTER TABLE accounts ALTER COLUMN issuer SET NOT NULL;
     END IF;
   END $$;`,
  `ALTER TABLE accounts ALTER COLUMN id SET DEFAULT gen_random_uuid()::text`,
  `ALTER TABLE accounts ALTER COLUMN issuer SET DEFAULT ''`,
  `CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts (user_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS uq_accounts_provider_account ON accounts (provider_id, account_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS uq_accounts_issuer_account ON accounts (issuer, account_id)`,
  `CREATE TABLE IF NOT EXISTS verifications (
      id          TEXT        PRIMARY KEY,
      identifier  TEXT        NOT NULL,
      value       TEXT        NOT NULL,
      expires_at  TIMESTAMPTZ NOT NULL,
      created_at  TIMESTAMPTZ,
      updated_at  TIMESTAMPTZ
    )`,
  `ALTER TABLE verifications ALTER COLUMN id SET DEFAULT gen_random_uuid()::text`,
  `CREATE INDEX IF NOT EXISTS idx_verifications_identifier ON verifications (identifier)`,
  // Short-lived marker for signup-intent OAuth flows: proves that THIS state
  // token created a fresh user before any Google identity is linked to it.
  // Rows are consumed on use and swept on expiry/startup; user_id cascades so
  // markers never outlive the users they refer to.
  `CREATE TABLE IF NOT EXISTS oauth_flow_markers (
      state_token  TEXT        PRIMARY KEY,
      user_id      UUID        NOT NULL,
      expires_at   TIMESTAMPTZ NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_oauth_flow_markers_user FOREIGN KEY (user_id)
          REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
    )`,
  `CREATE INDEX IF NOT EXISTS idx_oauth_flow_markers_expires_at ON oauth_flow_markers (expires_at)`,
  `DELETE FROM oauth_flow_markers WHERE expires_at < NOW()`,
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

export async function ensureBetterAuthSchema(pool: Pool) {
  for (const statement of statements) {
    await runStatement(pool, statement);
  }
}
