import { AppError } from '../../utils/AppError.js';
import type { User } from './types.js';
import * as repo from './auth.repository.js';

function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    role: user.role,
    email_verified: user.email_verified,
    is_active: user.is_active,
    last_login: user.last_login,
    created_by: user.created_by,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export async function getMe(userId: string): Promise<any> {
  const user = await repo.findUserById(userId);
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
  const result = toPublicUser(user) as any;
  if (user.role === 'driver') {
    const driverProfile = await repo.findDriverByUserId(userId);
    if (driverProfile) {
      result.driver_id = driverProfile.id;
    }
  }
  return result;
}
