import { Router, Request, Response } from "express";
import { pool } from "../db/pool.js";
import { authenticate, authorize } from "../modules/auth/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// GET /api/users - Fetch all users (admin & fleet_manager only)
router.get(
  "/",
  authenticate,
  authorize("admin", "fleet_manager"),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        full_name, 
        role, 
        phone, 
        email_verified, 
        is_active, 
        approval_status, 
        created_at, 
        last_login
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({ success: true, message: "Users fetched successfully.", data: result.rows });
  })
);

export default router;
