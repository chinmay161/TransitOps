import { Pool } from "pg";

// ---------------------------------------------------------------------------
// Admin accounts for development / testing phase.
//
// Passwords are NEVER hardcoded. The initial bootstrap password is read from
// the ADMIN_INITIAL_PASSWORD environment variable. Better Auth's official
// password hasher (scrypt via hashPassword) is used to hash credentials
// before storing them in the database.
//
// This seed is idempotent:
//   - Existing users (matched by email) are never recreated.
//   - Existing credential accounts are never modified or overwritten.
//   - Only missing accounts are created.
// ---------------------------------------------------------------------------

interface AdminAccount {
  email: string;
  fullName: string;
}

// Admin account profiles. Passwords come from ADMIN_INITIAL_PASSWORD env var.
const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    email: "2025.shivam.mishra@ves.ac.in",
    fullName: "Shivam Mishra",
  },
  {
    email: "2025.chinmay.wankhede@ves.ac.in",
    fullName: "Chinmay Wankhede",
  },
  {
    email: "2025.yash.singh@ves.ac.in",
    fullName: "Yash Singh",
  },
];

/**
 * Seed admin accounts into the existing Better Auth user/account tables.
 * Safe to call on every startup — existing credentials are never overwritten.
 */
export async function seedAdminAccounts(pool: Pool): Promise<void> {
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!initialPassword) {
    console.log(
      "[seed] ADMIN_INITIAL_PASSWORD not set — skipping admin credential seeding"
    );
    return;
  }

  // Lazy-import so the module can be loaded even if better-auth/crypto
  // is not yet resolved (e.g. during type-checking).
  const { hashPassword } = await import("better-auth/crypto");

  for (const account of ADMIN_ACCOUNTS) {
    const email = account.email.toLowerCase().trim();

    // 1. Check whether the user already exists.
    const existing = await pool.query(
      "SELECT id, role FROM users WHERE email = $1",
      [email]
    );

    let userId: string;

    if (existing.rows.length === 0) {
      // 2a. Create the user row with admin role (only for brand-new accounts).
      const insertUser = await pool.query(
        `INSERT INTO users (email, full_name, role, email_verified, is_active)
         VALUES ($1, $2, 'admin', true, true)
         RETURNING id`,
        [email, account.fullName]
      );
      userId = insertUser.rows[0].id;
      console.log(`[seed] Admin account created: ${email}`);
    } else {
      // 2b. User exists — preserve its current role exactly.
      // The Admin User Management system controls role assignments;
      // startup seeding must never override those decisions.
      userId = existing.rows[0].id;
    }

    // 3. Check whether a credential account already exists.
    const existingCredential = await pool.query(
      `SELECT id FROM accounts WHERE provider_id = 'credential' AND account_id = $1`,
      [userId]
    );

    if (existingCredential.rows.length > 0) {
      // Credential already exists — do NOT overwrite the password hash.
      console.log(`[seed] Admin account already exists: ${email}`);
      continue;
    }

    // 4. Create a new credential account with the initial password hash.
    const hashedPassword = await hashPassword(initialPassword);
    const credentialIssuer = "local:credential";

    await pool.query(
      `INSERT INTO accounts (user_id, account_id, provider_id, password, issuer)
       VALUES ($1, $2, 'credential', $3, $4)
       ON CONFLICT (provider_id, account_id) DO NOTHING`,
      [userId, userId, hashedPassword, credentialIssuer]
    );

    console.log(`[seed] Admin credential created: ${email}`);
  }

  console.log("[seed] Admin account seeding complete");
}
