export type UserRole = "admin" | "fleet_manager" | "dispatcher" | "driver";

const roleRoutes: Record<UserRole, string> = {
  driver: "/drivers",
  dispatcher: "/drivers",
  fleet_manager: "/vehicles",
  admin: "/admin-settings",
};

export function resolveDashboardRoute(role: UserRole | string): string {
  return roleRoutes[role as UserRole] || "/login";
}
