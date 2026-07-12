"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { List, X } from "@phosphor-icons/react";

const navLinks = [
  { label: "Features", href: "#features" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
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

          {/* Desktop Nav */}
          <nav
            style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "flex-end" }}
            className="nav-desktop"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                id={`nav-${link.label.toLowerCase()}`}
                style={{
                  padding: "6px 13px",
                  borderRadius: "7px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#6B7FA3",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "color 150ms ease, background 150ms ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = "#F0F4FF";
                  el.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = "#6B7FA3";
                  el.style.background = "transparent";
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA row */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }} className="nav-desktop">
            <a
              href="/login"
              id="nav-login"
              style={{
                padding: "7px 16px",
                borderRadius: "7px",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#6B7FA3",
                textDecoration: "none",
                transition: "color 150ms ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F0F4FF")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#6B7FA3")}
            >
              Login
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="nav-mobile-btn"
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B7FA3",
              padding: "6px",
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "fixed",
              top: "60px",
              left: 0,
              right: 0,
              zIndex: 99,
              background: "rgba(7,13,26,0.97)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              padding: "16px 24px 24px",
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "16px" }}>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: "#6B7FA3",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div style={{ display: "flex", gap: "10px" }}>
              <a href="/login" className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>Login</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
