"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { resolveDashboardRoute } from "@/utils/resolve-dashboard-route";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { authenticated, user, logout } = useAuth();
  const router = useRouter();

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
          ? "rgba(7, 13, 26, 0.92)"
          : "rgba(7, 13, 26, 0.6)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(255,255,255,0.04)",
        transition: "background 260ms ease, border-color 260ms ease",
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
            gap: "9px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #F5A623 0%, #D4891A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(245,166,35,0.35)",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="8" width="11" height="7" rx="1.5" fill="white" fillOpacity="0.95" />
              <path d="M12 10h3.5l2.5 3v2H12V10z" fill="white" fillOpacity="0.85" />
              <circle cx="5" cy="15.5" r="1.5" fill="#D4891A" />
              <circle cx="14.5" cy="15.5" r="1.5" fill="#D4891A" />
            </svg>
          </div>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#F0F4FF", letterSpacing: "-0.02em" }}>
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
              <a
                href={resolveDashboardRoute(user?.role || "")}
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#F0F4FF",
                  textDecoration: "none",
                  transition: "color 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--amber)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#F0F4FF";
                }}
              >
                Go to Dashboard
              </a>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#EF4444",
                  border: "1.5px solid rgba(239, 68, 68, 0.4)",
                  background: "rgba(239, 68, 68, 0.04)",
                  cursor: "pointer",
                  transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.color = "#050A14";
                  el.style.background = "#EF4444";
                  el.style.borderColor = "#EF4444";
                  el.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.2)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.color = "#EF4444";
                  el.style.background = "rgba(239, 68, 68, 0.04)";
                  el.style.borderColor = "rgba(239, 68, 68, 0.4)";
                  el.style.boxShadow = "none";
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <a
              href="/login"
              id="nav-login"
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#F5A623",
                border: "1.5px solid rgba(245, 166, 35, 0.4)",
                background: "rgba(245, 166, 35, 0.04)",
                textDecoration: "none",
                transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = "#050A14";
                el.style.background = "#F5A623";
                el.style.borderColor = "#F5A623";
                el.style.transform = "translateY(-1px)";
                el.style.boxShadow = "0 4px 12px rgba(245, 166, 35, 0.2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.color = "#F5A623";
                el.style.background = "rgba(245, 166, 35, 0.04)";
                el.style.borderColor = "rgba(245, 166, 35, 0.4)";
                el.style.transform = "none";
                el.style.boxShadow = "none";
              }}
            >
              Login
            </a>
          )}
        </div>
      </div>
    </motion.header>
  );
}
