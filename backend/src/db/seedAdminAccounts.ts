import { Pool } from "pg";

// ---------------------------------------------------------------------------
// Temporary admin accounts for development / testing phase.
// PLAINTEXT PASSWORDS ARE CONFIGURED IN THIS FILE for seeding purposes.
// They are hashed at runtime using Better Auth's official password hasher
// (scrypt) before being stored in the database.  Do NOT commit this file
// to a public repository.
//
// This seed is idempotent:
//   - Existing users (matched by email) are never recreated.
//   - If an existing user lost the admin role, it is re-promoted.
//   - The credential account password hash is always overwritten to match
//     the configured password so that the current temporary credentials
//     are always active.
// ---------------------------------------------------------------------------

interface AdminAccount {
  email: string;
  password: string;
  fullName: string;
}

const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    email: "2025.shivam.mishra@ves.ac.in",
    password: "Shivam@TransitOps",
    fullName: "Shivam Mishra",
  },
  {
    email: "2025.chinmay.wankhede@ves.ac.in",
    password: "Chinmay@TransitOps",
    fullName: "Chinmay Wankhede",
  },
  {
    email: "2025.yash.singh@ves.ac.in",
    password: "Yash@TransitOps",
    fullName: "Yash Singh",
  },
];

/**
 * Seed the three temporary admin accounts into the existing Better Auth
 * user/account tables.  Safe to call on every startup.
 */
export async function seedAdminAccounts(pool: Pool): Promise<void> {
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
      // 2a. Create the user row with admin role.
      const insertUser = await pool.query(
        `INSERT INTO users (email, full_name, role, email_verified, is_active)
         VALUES ($1, $2, 'admin', true, true)
         ON CONFLICT (email) DO UPDATE SET role = 'admin'
         RETURNING id`,
        [email, account.fullName]
      );
      userId = insertUser.rows[0].id;
      console.log(`[seed] Created admin user: ${email}`);
    } else {
      userId = existing.rows[0].id;
      // 2b. Ensure the role is admin (promote if needed).
      if (existing.rows[0].role !== "admin") {
        await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [
          userId,
        ]);
        console.log(`[seed] Promoted user ${email} to admin role`);
      }
    }

    // 3. Ensure a credential account exists with the current configured
    //    password hash.  Better Auth's sign-in matches on:
    //      provider_id = 'credential'
    //      issuer      = 'local:credential' (createLocalAccountIssuer)
    //      account_id  = user.id
    const credentialIssuer = "local:credential";
    const hashedPassword = await hashPassword(account.password);

    // Always overwrite the password hash so the configured temporary
    // password is guaranteed to be active.
    const upserted = await pool.query(
      `INSERT INTO accounts (user_id, account_id, provider_id, password, issuer)
       VALUES ($1, $2, 'credential', $3, $4)
       ON CONFLICT (provider_id, account_id)
       DO UPDATE SET password = EXCLUDED.password, updated_at = NOW()
       RETURNING id`,
      [userId, userId, hashedPassword, credentialIssuer]
    );

    if (upserted.rowCount === 1) {
      // Detect whether this was an INSERT or UPDATE by checking the
      // original state.  We only log on first create; the password is
      // always silently refreshed.
      const wasNew = existing.rows.length === 0;
      if (wasNew) {
        console.log(`[seed] Created credential account for: ${email}`);
      } else {
        console.log(`[seed] Refreshed credential password for: ${email}`);
      }
    }
  }

  console.log("[seed] Admin account seeding complete");
}
