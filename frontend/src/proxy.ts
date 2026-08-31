import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveDashboardRoute } from "./utils/resolve-dashboard-route";

// Better Auth session cookies (plain http and __Secure- prefixed https variant)
const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

const KNOWN_ROLES = ["admin", "fleet_manager", "dispatcher", "driver"];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => request.cookies.get(name)?.value);
}

type SessionState =
  | { state: "authenticated"; role: string }
  | { state: "unauthenticated" }
  | { state: "unknown" };

// Verify the session server-to-server. Client state alone can never grant
// access: the httpOnly Better Auth cookie must resolve to a live backend
// session with a real TransitOps role.
// Uses request.nextUrl.origin to construct an absolute URL that works in both
// localhost development and Vercel production (where NEXT_PUBLIC_API_URL=/api/backend
// would otherwise result in an empty base URL).
async function resolveSession(request: NextRequest): Promise<SessionState> {
  if (!hasSessionCookie(request)) {
    return { state: "unauthenticated" };
  }

  const authUrl = `${request.nextUrl.origin}/api/auth/me`;

  try {
    const res = await fetch(authUrl, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      return { state: "unauthenticated" };
    }
    if (!res.ok) {
      return { state: "unknown" };
    }

    const body = await res.json().catch(() => null);
    const role = body?.data?.role;
    if (!role) {
      return { state: "unauthenticated" };
    }
    return { state: "authenticated", role };
  } catch {
    return { state: "unknown" };
  }
}

function clearSessionCookies(response: NextResponse): NextResponse {
  for (const name of SESSION_COOKIE_NAMES) {
    response.cookies.delete(name);
  }
  return response;
}

function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public landing page
  if (pathname === "/") {
    return NextResponse.next();
  }

  const session = await resolveSession(request);

  // Holding page for Google users without an assigned TransitOps role
  if (pathname === "/pending") {
    if (session.state !== "authenticated") {
      return clearSessionCookies(redirectTo(request, "/login"));
    }
    if (KNOWN_ROLES.includes(session.role)) {
      return redirectTo(request, resolveDashboardRoute(session.role));
    }
    return NextResponse.next();
  }

  // ---- /admin/login: dedicated admin credential sign-in ----
  if (pathname === "/admin/login") {
    if (session.state === "authenticated") {
      // Already signed in — redirect to appropriate destination
      if (session.role === "admin") {
        return redirectTo(request, "/dashboard/users");
      }
      if (KNOWN_ROLES.includes(session.role)) {
        return redirectTo(request, resolveDashboardRoute(session.role));
      }
      return redirectTo(request, "/pending");
    }
    // Unauthenticated: allow access to admin login page
    return NextResponse.next();
  }

  // ---- /admin-settings: redirect admins to user management ----
  if (pathname === "/admin-settings" || pathname.startsWith("/admin-settings/")) {
    if (session.state !== "authenticated") {
      // Unauthenticated → admin login (not generic /login)
      const target =
        session.state === "unknown"
          ? "/admin/login?error=server"
          : "/admin/login";
      return clearSessionCookies(redirectTo(request, target));
    }
    // Non-admin users cannot access admin-settings
    if (session.role !== "admin") {
      if (KNOWN_ROLES.includes(session.role)) {
        return redirectTo(request, resolveDashboardRoute(session.role));
      }
      return redirectTo(request, "/pending");
    }
    // Admin: redirect to user management
    return redirectTo(request, "/dashboard/users");
  }

  // ---- /login: normal user login ----
  if (pathname === "/login") {
    if (session.state === "authenticated") {
      // Admin users should use /admin/login, not /login
      if (session.role === "admin") {
        return redirectTo(request, "/dashboard/users");
      }
      if (!KNOWN_ROLES.includes(session.role)) {
        return redirectTo(request, "/pending");
      }
      return redirectTo(request, resolveDashboardRoute(session.role));
    }
    return NextResponse.next();
  }

  // ---- All other private pages ----
  if (session.state !== "authenticated") {
    const target =
      session.state === "unknown" ? "/login?error=server" : "/login";
    return clearSessionCookies(redirectTo(request, target));
  }

  const role = session.role;

  // Users without a usable role are held on the pending page
  if (!KNOWN_ROLES.includes(role)) {
    return redirectTo(request, "/pending");
  }

  // Admin users have full access

  // Enforce role-based client routing constraints
  if (role === "driver") {
    const allowed = ["/dashboard", "/fuel-log", "/expenses", "/notifications"];
    const isAllowed = allowed.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );
    if (!isAllowed) {
      return redirectTo(request, "/dashboard");
    }
  } else if (role === "dispatcher") {
    const allowed = ["/drivers", "/trips", "/notifications"];
    const isAllowed = allowed.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );
    if (!isAllowed) {
      return redirectTo(request, "/drivers");
    }
  } else if (role === "fleet_manager") {
    // Fleet managers can access everything except admin settings
    if (pathname.startsWith("/admin-settings")) {
      return redirectTo(request, "/vehicles");
    }
  } else if (role === "admin") {
    // Admins have full access
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg (vector icon file)
     * - public (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|api|public).*)",
  ],
};
