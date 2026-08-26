-- Seed test user for local development
-- Identity is provisioned via Google OAuth: this row simply pre-registers
-- an account so that signing in with a matching Google email links to it.

INSERT INTO users (id, email, full_name, phone, role, email_verified, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'driver@transitops.com',
  'Test Driver',
  '+1234567890',
  'driver',
  TRUE,
  TRUE,
  NOW(),
  NOW()
);

INSERT INTO drivers (user_id, license_number, license_expiry, license_type, status, hire_date, created_at, updated_at)
SELECT
  id,
  'DL-TEST-001',
  '2030-12-31',
  'Standard',
  'available',
  '2025-01-01',
  NOW(),
  NOW()
FROM users
WHERE email = 'driver@transitops.com';
