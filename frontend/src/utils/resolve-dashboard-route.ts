export type UserRole = "admin" | "fleet_manager" | "dispatcher" | "driver";

const roleRoutes: Record<UserRole, string> = {
  driver: "/drivers",
  admin: "/",
  fleet_manager: "/",
  dispatcher: "/",
};

export function resolveDashboardRoute(role: UserRole | string): string {
  return roleRoutes[role as UserRole] || "/login";
}
