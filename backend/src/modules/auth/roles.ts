import type { UserRole } from './types.js';

const roleHierarchy: Record<UserRole, number> = {
  admin: 100,
  fleet_manager: 80,
  dispatcher: 50,
  driver: 30,
};

export function roleAtLeast(userRole: UserRole, requiredRole: UserRole): boolean {
  return (roleHierarchy[userRole] ?? 0) >= (roleHierarchy[requiredRole] ?? 0);
}
