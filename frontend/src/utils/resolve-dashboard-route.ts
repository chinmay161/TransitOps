export type UserRole = "admin" | "fleet_manager" | "dispatcher" | "driver";

const roleRoutes: Record<UserRole, string> = {
  driver: "/dashboard",
  dispatcher: "/drivers",
  fleet_manager: "/vehicles",
  admin: "/dashboard/users",
};

export function resolveDashboardRoute(role: UserRole | string): string {
  return roleRoutes[role as UserRole] || "/login";
}
