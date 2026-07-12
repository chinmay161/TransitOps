-- Seed test user for login testing
-- Email: driver@transitops.com / Password: password123

INSERT INTO users (id, email, password_hash, full_name, phone, role, must_change_password, email_verified, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'driver@transitops.com',
  '$2b$12$x9pbMLHKzdV84JhZ1Qj.eefsW3tX7SESfmSluZoT/JQAM6XfudKYC',
  'Test Driver',
  '+1234567890',
  'driver',
  FALSE,
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
