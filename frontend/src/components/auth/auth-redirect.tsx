"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { resolveDashboardRoute } from "@/utils/resolve-dashboard-route";

/**
 * Client-side redirect for authenticated users hitting the landing page.
 * Complements the middleware: handles cases where the session was set after
 * the initial page load (e.g. after Google OAuth callback).
 */
export function AuthRedirect() {
  const { authenticated, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !authenticated) return;
    if (role) {
      router.replace(resolveDashboardRoute(role));
    }
  }, [authenticated, loading, role, router]);

  return null;
}
