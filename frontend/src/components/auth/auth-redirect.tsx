"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { resolveDashboardRoute } from "@/utils/resolve-dashboard-route";

const KNOWN_ROLES = ["admin", "fleet_manager", "dispatcher", "driver"];

/**
 * Client-side redirect for authenticated users hitting the landing page.
 * Complements the middleware: handles cases where the session was set after
 * the initial page load (e.g. after Google OAuth callback).
 * 
 * The landing page "/" must remain public for unauthenticated visitors.
 * Only redirect when authentication is positively confirmed.
 */
export function AuthRedirect() {
  const { authenticated, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!authenticated) return;
    if (!role) return;
    if (KNOWN_ROLES.includes(role)) {
      router.replace(resolveDashboardRoute(role));
    } else {
      router.replace("/pending");
    }
  }, [authenticated, loading, role, router]);

  return null;
}
