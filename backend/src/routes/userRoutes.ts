import { Router, Response } from "express";
import { pool } from "../db/pool.js";
import { authenticate, authorize } from "../modules/auth/auth.middleware.js";
import type { AuthRequest } from "../modules/auth/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const VALID_ROLES = ["admin", "fleet_manager", "dispatcher", "driver", "pending"] as const;

// GET /api/users - Fetch all users (admin & fleet_manager only)
router.get(
  "/",
  authenticate,
  authorize("admin", "fleet_manager"),
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        full_name, 
        role, 
        phone, 
        email_verified, 
        is_active, 
        created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({ success: true, message: "Users fetched successfully.", data: result.rows });
  })
);

// PATCH /api/users/:id/role - Update a user's role (admin only)
router.patch(
  "/:id/role",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`,
      });
    }

    // Self-demotion protection: prevent admin from removing their own admin role
    if (req.user!.userId === id && role !== "admin") {
      return res.status(400).json({
        error: "You cannot change your own role away from admin.",
      });
    }

    // Verify target user exists
    const existing = await pool.query("SELECT id, role FROM users WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const result = await pool.query(
      "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, full_name, role, phone, email_verified, is_active, created_at",
      [role, id]
    );

    res.json({ success: true, message: "User role updated.", data: result.rows[0] });
  })
);

export default router;
