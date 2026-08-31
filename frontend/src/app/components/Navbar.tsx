"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { resolveDashboardRoute } from "@/utils/resolve-dashboard-route";
import { TransitOpsLogo } from "@/components/brand/TransitOpsLogo";

const DASHBOARD_ROUTES = [
  "/dashboard",
  "/vehicles",
  "/drivers",
  "/trips",
  "/maintenance",
  "/fuel-log",
  "/expenses",
  "/reports",
  "/dashboard/users",
  "/admin-settings",
  "/notifications",
];

function isDashboardRoute(pathname: string) {
  return DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { authenticated, user, logout, signInWithGoogle } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const onDashboard = isDashboardRoute(pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const startGoogleFlow = (intent: "login" | "signup") => {
    void signInWithGoogle(intent).catch((err) => {
      console.error(err);
    });
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "60px",
        display: "flex",
        alignItems: "center",
        background: scrolled
          ? "var(--bg-surface)"
          : "var(--bg-base)",
        borderBottom: scrolled
          ? "2px solid var(--border)"
          : "2px solid var(--border-subtle)",
        transition: "background 200ms ease, border-color 200ms ease",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          height: "100%",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          id="navbar-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <TransitOpsLogo size={24} />
          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            TransitOps
          </span>
        </a>

        {/* Auth Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          {authenticated ? (
            <>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500, display: "none" }}>
                Signed in as <strong style={{ color: "var(--text-primary)" }}>{user?.full_name}</strong>
              </span>
              {!onDashboard && (
                <a
                  href={resolveDashboardRoute(user?.role || "")}
                  className="text-sm font-bold text-[var(--text-primary)] no-underline transition-colors duration-150 hover:text-[var(--amber)]"
                >
                  Go to Dashboard
                </a>
              )}
              <button
                onClick={handleLogout}
                className="rounded-[var(--radius-md)] border-2 border-[var(--red)]/40 bg-[var(--red-light)] px-5 py-2 text-sm font-bold text-[var(--red)] transition-all duration-100 hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(239,68,68,0.3)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(8px, 1.5vw, 14px)",
              }}
            >
              <a
                href="/login"
                id="nav-signup"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  startGoogleFlow("signup");
                }}
                className="rounded-[var(--radius-md)] border-2 border-[#0B0F1A] bg-[var(--amber)] px-5 py-2 text-sm font-bold text-[#0B0F1A] no-underline whitespace-nowrap shadow-[var(--shadow-card)] transition-all duration-100 hover:bg-[var(--amber-dark)] hover:shadow-[var(--shadow-elevated)] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Sign Up
              </a>

              <a
                href="/login"
                id="nav-login"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  startGoogleFlow("login");
                }}
                className="rounded-[var(--radius-md)] border-2 border-[var(--amber)]/40 bg-[var(--amber-light)] px-5 py-2 text-sm font-bold text-[var(--amber)] no-underline whitespace-nowrap transition-all duration-100 hover:bg-[var(--amber)] hover:text-[#0B0F1A] hover:border-[var(--amber)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(245,166,35,0.3)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                Login
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
