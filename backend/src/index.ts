import express, { NextFunction, Request, Response } from "express";
import { env } from "./config/env";
import { FuelLogController } from "./controllers/fuelLogController";
import { ensureFuelLogSchema } from "./db/ensureFuelLogSchema";
import { pool } from "./db/pool";
import { createFuelLogRouter } from "./routes/fuelLogRoutes";
import { FuelLogService } from "./services/fuelLogService";
import { ApiError, sendError } from "./utils/api";

const app = express();

app.use(express.json({ limit: "10mb" }));

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const fuelLogService = new FuelLogService(pool);
const fuelLogController = new FuelLogController(fuelLogService);

// Helper for validating driver fields
function validateDriver(data: any, isUpdate = false) {
  const errors: string[] = [];
  const {
    full_name,
    email,
    phone,
    license_number,
    license_expiry,
    status,
    emergency_phone,
    hire_date,
  } = data;

  if (!isUpdate) {
    if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
      errors.push('Full name is required');
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      errors.push('Valid email is required');
    }
  } else {
    if (full_name !== undefined && (!full_name || typeof full_name !== 'string' || !full_name.trim())) {
      errors.push('Full name cannot be empty');
    }
    if (email !== undefined && (!email || typeof email !== 'string' || !email.includes('@'))) {
      errors.push('Valid email is required');
    }
  }

  const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
  if (phone && !phoneRegex.test(phone)) {
    errors.push('Invalid phone number format. Must be 7-20 digits and may include +, -, space, or parentheses.');
  }

  if (emergency_phone && !phoneRegex.test(emergency_phone)) {
    errors.push('Invalid emergency phone number format. Must be 7-20 digits and may include +, -, space, or parentheses.');
  }

  if (!isUpdate || license_number !== undefined) {
    if (!license_number || typeof license_number !== 'string' || !license_number.trim()) {
      errors.push('License number is required');
    }
  }

  if (!isUpdate || license_expiry !== undefined) {
    if (!license_expiry) {
      errors.push('License expiry date is required');
    } else {
      const date = new Date(license_expiry);
      if (isNaN(date.getTime())) {
        errors.push('License expiry must be a valid date');
      }
    }
  }

  if (!isUpdate || hire_date !== undefined) {
    if (!hire_date) {
      errors.push('Hire date is required');
    } else {
      const date = new Date(hire_date);
      if (isNaN(date.getTime())) {
        errors.push('Hire date must be a valid date');
      } else {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Allow today
        if (date > today) {
          errors.push('Hire date cannot be in the future');
        }
      }
    }
  }

  const validStatuses = ['available', 'on_trip', 'on_leave', 'inactive'];
  if (status && !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  return errors;
}

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Welcome to TransitOps API", data: null });
});

app.get("/db-test", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Connected to PostgreSQL successfully",
      data: { time: result.rows[0].now },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to connect to PostgreSQL";
    sendError(res, 500, message);
  }
});

// GET /drivers - Fetch all drivers with joined users
app.get('/drivers', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        d.id,
        d.user_id,
        d.license_number,
        TO_CHAR(d.license_expiry, 'YYYY-MM-DD') as license_expiry,
        d.license_type,
        d.status,
        d.emergency_contact,
        d.emergency_phone,
        TO_CHAR(d.hire_date, 'YYYY-MM-DD') as hire_date,
        d.fleet_manager_id,
        d.created_at,
        d.updated_at,
        u.full_name,
        u.email,
        u.phone,
        u.is_active
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      ORDER BY u.full_name ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers', details: error.message });
  }
});

// GET /drivers/:id - Fetch single driver
app.get('/drivers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        d.id,
        d.user_id,
        d.license_number,
        TO_CHAR(d.license_expiry, 'YYYY-MM-DD') as license_expiry,
        d.license_type,
        d.status,
        d.emergency_contact,
        d.emergency_phone,
        TO_CHAR(d.hire_date, 'YYYY-MM-DD') as hire_date,
        d.fleet_manager_id,
        d.created_at,
        d.updated_at,
        u.full_name,
        u.email,
        u.phone,
        u.is_active
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ error: 'Failed to fetch driver', details: error.message });
  }
});

// POST /drivers - Create user and driver profile
app.post('/drivers', async (req: Request, res: Response) => {
  const errors = validateDriver(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const {
    full_name,
    email,
    phone,
    license_number,
    license_expiry,
    license_type,
    status = 'available',
    emergency_contact,
    emergency_phone,
    hire_date,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert into users
    const userQuery = `
      INSERT INTO users (email, password_hash, full_name, phone, role, approval_status)
      VALUES ($1, $2, $3, $4, 'driver', 'approved')
      RETURNING id
    `;
    const dummyPasswordHash = '$2b$10$EpjJN9wH0Zt1V6W7Ua9hL.c5YdE2W.oO8j9t6V7zUuK1Jc9e2b1qG'; // bcrypt hash for password123
    const userResult = await client.query(userQuery, [
      email.toLowerCase().trim(),
      dummyPasswordHash,
      full_name.trim(),
      phone || null,
    ]);
    const userId = userResult.rows[0].id;

    // 2. Insert into drivers
    const driverQuery = `
      INSERT INTO drivers (user_id, license_number, license_expiry, license_type, status, emergency_contact, emergency_phone, hire_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, user_id, license_number, TO_CHAR(license_expiry, 'YYYY-MM-DD') as license_expiry, license_type, status, emergency_contact, emergency_phone, TO_CHAR(hire_date, 'YYYY-MM-DD') as hire_date, created_at, updated_at
    `;
    const driverResult = await client.query(driverQuery, [
      userId,
      license_number.trim(),
      license_expiry,
      license_type || null,
      status,
      emergency_contact || null,
      emergency_phone || null,
      hire_date,
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      ...driverResult.rows[0],
      full_name,
      email,
      phone,
      is_active: true,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating driver:', error);
    
    // Handle uniqueness constraints
    if (error.code === '23505') {
      if (error.constraint === 'uq_users_email') {
        return res.status(400).json({ error: 'Email address already exists' });
      }
      if (error.constraint === 'uq_drivers_license_number') {
        return res.status(400).json({ error: 'License number already exists' });
      }
    }
    
    res.status(500).json({ error: 'Failed to create driver', details: error.message });
  } finally {
    client.release();
  }
});

// PUT /drivers/:id - Update driver and associated user details
app.put('/drivers/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const errors = validateDriver(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const {
    full_name,
    email,
    phone,
    license_number,
    license_expiry,
    license_type,
    status,
    emergency_contact,
    emergency_phone,
    hire_date,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get user_id first
    const getUserIdQuery = 'SELECT user_id FROM drivers WHERE id = $1';
    const userIdResult = await client.query(getUserIdQuery, [id]);
    if (userIdResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Driver not found' });
    }
    const userId = userIdResult.rows[0].user_id;

    // Update users table
    const updateUserQuery = `
      UPDATE users
      SET 
        full_name = COALESCE($1, full_name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        updated_at = NOW()
      WHERE id = $4
    `;
    await client.query(updateUserQuery, [
      full_name ? full_name.trim() : null,
      email ? email.toLowerCase().trim() : null,
      phone !== undefined ? (phone || null) : undefined,
      userId,
    ]);

    // Update drivers table
    const updateDriverQuery = `
      UPDATE drivers
      SET
        license_number = COALESCE($1, license_number),
        license_expiry = COALESCE($2, license_expiry),
        license_type = COALESCE($3, license_type),
        status = COALESCE($4, status),
        emergency_contact = COALESCE($5, emergency_contact),
        emergency_phone = COALESCE($6, emergency_phone),
        hire_date = COALESCE($7, hire_date),
        updated_at = NOW()
      WHERE id = $8
    `;
    await client.query(updateDriverQuery, [
      license_number ? license_number.trim() : null,
      license_expiry || null,
      license_type !== undefined ? (license_type || null) : undefined,
      status || null,
      emergency_contact !== undefined ? (emergency_contact || null) : undefined,
      emergency_phone !== undefined ? (emergency_phone || null) : undefined,
      hire_date || null,
      id,
    ]);

    await client.query('COMMIT');

    // Fetch the fully updated row
    const finalResultQuery = `
      SELECT 
        d.id,
        d.user_id,
        d.license_number,
        TO_CHAR(d.license_expiry, 'YYYY-MM-DD') as license_expiry,
        d.license_type,
        d.status,
        d.emergency_contact,
        d.emergency_phone,
        TO_CHAR(d.hire_date, 'YYYY-MM-DD') as hire_date,
        d.fleet_manager_id,
        d.created_at,
        d.updated_at,
        u.full_name,
        u.email,
        u.phone,
        u.is_active
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1
    `;
    const finalResult = await pool.query(finalResultQuery, [id]);
    res.json(finalResult.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating driver:', error);
    
    // Handle uniqueness constraints
    if (error.code === '23505') {
      if (error.constraint === 'uq_users_email') {
        return res.status(400).json({ error: 'Email address already exists' });
      }
      if (error.constraint === 'uq_drivers_license_number') {
        return res.status(400).json({ error: 'License number already exists' });
      }
    }
    
    res.status(500).json({ error: 'Failed to update driver', details: error.message });
  } finally {
    client.release();
  }
});

// DELETE /drivers/:id - Cascade delete user and driver profiles
app.delete('/drivers/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get user_id first
    const getUserIdQuery = 'SELECT user_id FROM drivers WHERE id = $1';
    const userIdResult = await client.query(getUserIdQuery, [id]);
    if (userIdResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Driver not found' });
    }
    const userId = userIdResult.rows[0].user_id;

    // Delete user from users table. This cascades and deletes the driver.
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Driver and associated user deleted successfully' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error deleting driver:', error);
    res.status(500).json({ error: 'Failed to delete driver', details: error.message });
  } finally {
    client.release();
  }
});

app.use("/api/fuel-logs", createFuelLogRouter(fuelLogController));

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ApiError) {
    sendError(res, error.statusCode, error.message);
    return;
  }

  console.error(error);
  sendError(res, 500, "Internal server error.");
});

async function startServer() {
  await ensureFuelLogSchema(pool);

  app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}`);
  });
}

void startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
