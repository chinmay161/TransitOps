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

import { MockDigiLockerService } from "./services/digilocker/MockDigiLockerService";
const mockDigiLockerService = new MockDigiLockerService(pool);

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
    const drivers = result.rows.map(driver => {
      const verification = mockDigiLockerService.getVerificationRecord(driver.id);
      return {
        ...driver,
        verification_status: verification ? 'verified' : 'pending',
        verification_source: verification ? verification.source : null,
        verification_date: verification ? verification.verifiedAt : null,
        verification_id: verification ? verification.verificationId : null,
      };
    });
    res.json(drivers);
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
    const driver = result.rows[0];
    const verification = mockDigiLockerService.getVerificationRecord(driver.id);
    res.json({
      ...driver,
      verification_status: verification ? 'verified' : 'pending',
      verification_source: verification ? verification.source : null,
      verification_date: verification ? verification.verifiedAt : null,
      verification_id: verification ? verification.verificationId : null,
    });
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


// Seeding mock vehicles on startup if table is empty
async function seedVehicles() {
  try {
    const checkQuery = 'SELECT COUNT(*) FROM vehicles';
    const result = await pool.query(checkQuery);
    const count = parseInt(result.rows[0].count);
    if (count === 0) {
      console.log('Seeding mock vehicles into database...');
      const seedQuery = `
        INSERT INTO vehicles (registration_number, vin, make, model, year, fuel_type, seating_capacity, status)
        VALUES 
          ('MH-12-AB-1234', 'VIN11111111111111', 'Toyota', 'Hiace', 2022, 'diesel', 12, 'available'),
          ('DL-12-CD-5678', 'VIN22222222222222', 'Volvo', '9400', 2021, 'diesel', 45, 'available'),
          ('MH-14-EF-9012', 'VIN33333333333333', 'Tata', 'Winger', 2023, 'cng', 15, 'available'),
          ('KA-03-GH-3456', 'VIN44444444444444', 'Mahindra', 'Supro', 2020, 'electric', 8, 'maintenance'),
          ('HR-55-IJ-7890', 'VIN55555555555555', 'Force', 'Traveller', 2019, 'diesel', 17, 'inactive')
      `;
      await pool.query(seedQuery);
      console.log('Mock vehicles seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding vehicles:', error);
  }
}

// GET /vehicles - Fetch list of vehicles (filter for selectable)
app.get('/vehicles', async (req: Request, res: Response) => {
  try {
    const { selectable } = req.query;
    let query = `
      SELECT 
        id,
        registration_number,
        vin,
        make,
        model,
        year,
        fuel_type,
        seating_capacity,
        status,
        current_odometer,
        TO_CHAR(insurance_expiry, 'YYYY-MM-DD') as insurance_expiry,
        TO_CHAR(registration_expiry, 'YYYY-MM-DD') as registration_expiry,
        TO_CHAR(last_maintenance_date, 'YYYY-MM-DD') as last_maintenance_date,
        TO_CHAR(next_maintenance_date, 'YYYY-MM-DD') as next_maintenance_date,
        created_at,
        updated_at
      FROM vehicles
    `;
    if (selectable === 'true') {
      query += ` WHERE status IN ('available', 'assigned')`;
    }
    query += ' ORDER BY make ASC, model ASC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles', details: error.message });
  }
});

// GET /maintenance - Fetch all maintenance records with vehicle details
app.get('/maintenance', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        m.id,
        m.vehicle_id,
        m.type,
        m.description,
        m.status,
        TO_CHAR(m.scheduled_date, 'YYYY-MM-DD') as scheduled_date,
        TO_CHAR(m.completed_date, 'YYYY-MM-DD') as completed_date,
        m.cost,
        m.notes,
        m.created_by,
        m.updated_by,
        m.created_at,
        m.updated_at,
        v.make,
        v.model,
        v.registration_number,
        v.status as vehicle_status
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      ORDER BY m.scheduled_date DESC, m.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching maintenance:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance records', details: error.message });
  }
});

// GET /maintenance/:id - Fetch single maintenance record
app.get('/maintenance/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        m.id,
        m.vehicle_id,
        m.type,
        m.description,
        m.status,
        TO_CHAR(m.scheduled_date, 'YYYY-MM-DD') as scheduled_date,
        TO_CHAR(m.completed_date, 'YYYY-MM-DD') as completed_date,
        m.cost,
        m.notes,
        m.created_by,
        m.updated_by,
        m.created_at,
        m.updated_at,
        v.make,
        v.model,
        v.registration_number,
        v.status as vehicle_status
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching maintenance details:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance details', details: error.message });
  }
});

// POST /maintenance - Create maintenance & update vehicle status to 'maintenance'
app.post('/maintenance', async (req: Request, res: Response) => {
  const { vehicle_id, type, description, status = 'scheduled', scheduled_date, completed_date, cost, notes } = req.body;
  
  if (!vehicle_id || !type || !scheduled_date) {
    return res.status(400).json({ error: 'Vehicle, maintenance type, and scheduled date are required.' });
  }
  
  if (cost !== undefined && cost !== null && Number(cost) < 0) {
    return res.status(400).json({ error: 'Maintenance cost cannot be negative.' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check vehicle status and active maintenance records
    const vehQuery = 'SELECT status FROM vehicles WHERE id = $1';
    const vehRes = await client.query(vehQuery, [vehicle_id]);
    if (vehRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Vehicle not found.' });
    }
    const currentVehStatus = vehRes.rows[0].status;
    
    if (currentVehStatus === 'inactive') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot schedule maintenance for a retired/inactive vehicle.' });
    }
    
    if (status !== 'completed') {
      // Check if vehicle has active maintenance records
      const activeQuery = `SELECT id FROM maintenance_records WHERE vehicle_id = $1 AND status IN ('scheduled', 'in_progress')`;
      const activeRes = await client.query(activeQuery, [vehicle_id]);
      if (activeRes.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Vehicle already has an active maintenance record.' });
      }
    }
    
    // Update vehicle status
    let nextVehStatus = currentVehStatus;
    if (status === 'completed') {
      nextVehStatus = 'available';
    } else {
      nextVehStatus = 'maintenance';
    }
    
    await client.query(`UPDATE vehicles SET status = $1, last_maintenance_date = CASE WHEN $2 = 'completed' THEN COALESCE($3, NOW()::date) ELSE last_maintenance_date END, updated_at = NOW() WHERE id = $4`, [
      nextVehStatus,
      status,
      completed_date || scheduled_date,
      vehicle_id
    ]);
    
    // Insert maintenance record
    const insQuery = `
      INSERT INTO maintenance_records (vehicle_id, type, description, status, scheduled_date, completed_date, cost, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, vehicle_id, type, description, status, TO_CHAR(scheduled_date, 'YYYY-MM-DD') as scheduled_date, TO_CHAR(completed_date, 'YYYY-MM-DD') as completed_date, cost, notes, created_at, updated_at
    `;
    const result = await client.query(insQuery, [
      vehicle_id,
      type,
      description || null,
      status,
      scheduled_date,
      status === 'completed' ? (completed_date || new Date().toISOString().split('T')[0]) : null,
      cost !== undefined && cost !== null ? Number(cost) : null,
      notes || null
    ]);
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating maintenance:', error);
    res.status(500).json({ error: 'Failed to create maintenance record', details: error.message });
  } finally {
    client.release();
  }
});

// PUT /maintenance/:id - Update maintenance and vehicle status
app.put('/maintenance/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { vehicle_id, type, description, status, scheduled_date, completed_date, cost, notes } = req.body;
  
  if (cost !== undefined && cost !== null && Number(cost) < 0) {
    return res.status(400).json({ error: 'Maintenance cost cannot be negative.' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Fetch existing maintenance record
    const getRecordQuery = 'SELECT * FROM maintenance_records WHERE id = $1';
    const recordRes = await client.query(getRecordQuery, [id]);
    if (recordRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Maintenance record not found.' });
    }
    const currentRecord = recordRes.rows[0];
    
    // Enforce read-only constraint on completed records
    if (currentRecord.status === 'completed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Completed maintenance records are read-only.' });
    }
    
    const targetVehicleId = vehicle_id || currentRecord.vehicle_id;
    const targetStatus = status || currentRecord.status;
    
    // Validate status transition
    if (currentRecord.status === 'in_progress' && targetStatus === 'scheduled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot revert maintenance from In Progress to Scheduled.' });
    }
    
    // If vehicle is being changed
    if (vehicle_id && vehicle_id !== currentRecord.vehicle_id) {
      // Check if new vehicle is retired
      const newVehQuery = 'SELECT status FROM vehicles WHERE id = $1';
      const newVehRes = await client.query(newVehQuery, [vehicle_id]);
      if (newVehRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'New vehicle not found.' });
      }
      if (newVehRes.rows[0].status === 'inactive') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cannot assign maintenance to a retired vehicle.' });
      }
      
      // If updating to an active status, check if the new vehicle has other active maintenance records
      if (targetStatus !== 'completed') {
        const activeQuery = `SELECT id FROM maintenance_records WHERE vehicle_id = $1 AND id != $2 AND status IN ('scheduled', 'in_progress')`;
        const activeRes = await client.query(activeQuery, [vehicle_id, id]);
        if (activeRes.rows.length > 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'New vehicle already has an active maintenance record.' });
        }
      }
      
      // Revert old vehicle status to available (unless retired)
      const oldVehQuery = 'SELECT status FROM vehicles WHERE id = $1';
      const oldVehRes = await client.query(oldVehQuery, [currentRecord.vehicle_id]);
      if (oldVehRes.rows.length > 0 && oldVehRes.rows[0].status !== 'inactive') {
        await client.query("UPDATE vehicles SET status = 'available' WHERE id = $1", [currentRecord.vehicle_id]);
      }
      
      // Update new vehicle status
      if (targetStatus !== 'completed') {
        await client.query("UPDATE vehicles SET status = 'maintenance' WHERE id = $1", [vehicle_id]);
      }
    }
    
    // Handle status transition to completed on the vehicle
    if (targetStatus === 'completed') {
      // Revert vehicle status back to available (unless inactive/retired)
      const vehQuery = 'SELECT status FROM vehicles WHERE id = $1';
      const vehRes = await client.query(vehQuery, [targetVehicleId]);
      if (vehRes.rows.length > 0 && vehRes.rows[0].status !== 'inactive') {
        const finalCompletedDate = completed_date || new Date().toISOString().split('T')[0];
        await client.query('UPDATE vehicles SET status = \'available\', last_maintenance_date = $1 WHERE id = $2', [
          finalCompletedDate,
          targetVehicleId
        ]);
      }
    } else {
      // Ensure vehicle status is in maintenance if record is active
      await client.query("UPDATE vehicles SET status = 'maintenance' WHERE id = $1", [targetVehicleId]);
    }
    
    // Update maintenance record
    const updateQuery = `
      UPDATE maintenance_records
      SET
        vehicle_id = COALESCE($1, vehicle_id),
        type = COALESCE($2, type),
        description = COALESCE($3, description),
        status = COALESCE($4, status),
        scheduled_date = COALESCE($5, scheduled_date),
        completed_date = CASE WHEN $4 = 'completed' THEN COALESCE($6, completed_date, NOW()::date) ELSE NULL END,
        cost = COALESCE($7, cost),
        notes = COALESCE($8, notes),
        updated_at = NOW()
      WHERE id = $9
    `;
    await client.query(updateQuery, [
      vehicle_id || null,
      type || null,
      description !== undefined ? (description || null) : undefined,
      status || null,
      scheduled_date || null,
      completed_date || null,
      cost !== undefined && cost !== null ? Number(cost) : null,
      notes !== undefined ? (notes || null) : undefined,
      id
    ]);
    
    await client.query('COMMIT');
    
    // Fetch with joined vehicle details
    const finalResultQuery = `
      SELECT 
        m.id,
        m.vehicle_id,
        m.type,
        m.description,
        m.status,
        TO_CHAR(m.scheduled_date, 'YYYY-MM-DD') as scheduled_date,
        TO_CHAR(m.completed_date, 'YYYY-MM-DD') as completed_date,
        m.cost,
        m.notes,
        m.created_by,
        m.updated_by,
        m.created_at,
        m.updated_at,
        v.make,
        v.model,
        v.registration_number,
        v.status as vehicle_status
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.id = $1
    `;
    const finalResult = await pool.query(finalResultQuery, [id]);
    res.json(finalResult.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating maintenance:', error);
    res.status(500).json({ error: 'Failed to update maintenance record', details: error.message });
  } finally {
    client.release();
  }
});

// DELETE /maintenance/:id - Delete maintenance & revert vehicle status to 'available' if it was active
app.delete('/maintenance/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get record details
    const getRecordQuery = 'SELECT vehicle_id, status FROM maintenance_records WHERE id = $1';
    const recordRes = await client.query(getRecordQuery, [id]);
    if (recordRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Maintenance record not found.' });
    }
    const { vehicle_id, status } = recordRes.rows[0];
    
    // Delete record
    await client.query('DELETE FROM maintenance_records WHERE id = $1', [id]);
    
    // If the deleted record was active, check if there are any remaining active records for the vehicle
    if (status !== 'completed') {
      const remainingActiveQuery = `SELECT id FROM maintenance_records WHERE vehicle_id = $1 AND status IN ('scheduled', 'in_progress')`;
      const remainingActiveRes = await client.query(remainingActiveQuery, [vehicle_id]);
      if (remainingActiveRes.rows.length === 0) {
        // Revert vehicle status to available (unless retired/inactive)
        const vehQuery = 'SELECT status FROM vehicles WHERE id = $1';
        const vehRes = await client.query(vehQuery, [vehicle_id]);
        if (vehRes.rows.length > 0 && vehRes.rows[0].status !== 'inactive') {
          await client.query("UPDATE vehicles SET status = 'available' WHERE id = $1", [vehicle_id]);
        }
      }
    }
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Maintenance record deleted successfully.' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error deleting maintenance:', error);
    res.status(500).json({ error: 'Failed to delete maintenance record', details: error.message });
  } finally {
    client.release();
  }
});

// POST /api/verification/verify - Verify driver license with mock DigiLocker
app.post('/api/verification/verify', async (req: Request, res: Response) => {
  const { driver_id, license_number } = req.body;
  if (!driver_id || !license_number) {
    return res.status(400).json({ error: 'Driver ID and license number are required.' });
  }
  try {
    const result = await mockDigiLockerService.verifyLicense(driver_id, license_number);
    res.json({ success: true, message: 'Verification successful', data: result });
  } catch (error: any) {
    console.error('Verification failed:', error.message);
    res.status(400).json({ error: error.message || 'Verification failed' });
  }
});

// GET /api/verification/status/:driverId - Get verification status of a driver
app.get('/api/verification/status/:driverId', (req: Request, res: Response) => {
  const { driverId } = req.params;
  const record = mockDigiLockerService.getVerificationRecord(driverId);
  res.json({
    verified: !!record,
    verification: record
  });
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
    seedVehicles();
  });
}

void startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
