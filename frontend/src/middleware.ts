import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authPaths = ["/login", "/register", "/verify-email", "/change-password"];

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  if (pathname === "/") {
    return NextResponse.next();
  }

  const isAuthPage = authPaths.some((path) => pathname === path);

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // If it's a private page and user has no token, redirect to /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Enforce role-based client routing constraints
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.role) {
    // If token is invalid or corrupt, redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    return response;
  }

  const role = decoded.role;

  if (role === "driver") {
    const allowed = ["/dashboard", "/fuel-log", "/expenses", "/notifications"];
    const isAllowed = allowed.some((path) => pathname === path || pathname.startsWith(path + "/"));
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else if (role === "dispatcher") {
    const allowed = ["/dashboard", "/trips", "/notifications"];
    const isAllowed = allowed.some((path) => pathname === path || pathname.startsWith(path + "/"));
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else if (role === "fleet_manager") {
    // Fleet managers can access everything except admin settings
    if (pathname === "/admin-settings" || pathname.startsWith("/admin-settings/")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else if (role === "admin") {
    // Admins have full access
  } else {
    // Unknown role
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    return response;
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
     * - public (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|public).*)",
  ],
};
