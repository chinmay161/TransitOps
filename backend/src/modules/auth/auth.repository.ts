import pool from '../../config/database.js';
import type { User } from './types.js';

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findDriverByUserId(userId: string): Promise<{ id: string } | null> {
  const result = await pool.query<{ id: string }>(
    'SELECT id FROM drivers WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}
