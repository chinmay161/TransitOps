"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { List, X } from "@phosphor-icons/react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Modules", href: "#modules" },
  { label: "Analytics", href: "#stats" },
  { label: "Pricing", href: "#pricing", disabled: true },
  { label: "Documentation", href: "#docs" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
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
          height: "64px",
          display: "flex",
          alignItems: "center",
          backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(226,232,240,0.8)" : "1px solid transparent",
          transition: "background-color 260ms ease, border-color 260ms ease, backdrop-filter 260ms ease",
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
              gap: "10px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            {/* Truck + Route Icon */}
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "9px",
                background: "linear-gradient(135deg, #F5A623 0%, #D4891A 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(245,166,35,0.35)",
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="1" y="8" width="11" height="7" rx="1.5" fill="white" fillOpacity="0.95" />
                <path d="M12 10h3.5l2.5 3v2H12V10z" fill="white" fillOpacity="0.85" />
                <circle cx="5" cy="15.5" r="1.5" fill="#D4891A" />
                <circle cx="14.5" cy="15.5" r="1.5" fill="#D4891A" />
                <path d="M3 8V5.5a1 1 0 011-1h5a1 1 0 011 1V8" stroke="white" strokeWidth="1.2" strokeOpacity="0.6" />
                <circle cx="6.5" cy="4" r="1" fill="white" fillOpacity="0.7" />
              </svg>
            </div>
            <span
              style={{
                fontSize: "1.0625rem",
                fontWeight: 700,
                color: "#0F172A",
                letterSpacing: "-0.02em",
              }}
            >
              TransitOps
            </span>
          </a>

          {/* Desktop Nav */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flex: 1,
              justifyContent: "center",
            }}
            className="hidden-mobile"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.disabled ? undefined : link.href}
                id={`nav-${link.label.toLowerCase()}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: link.disabled ? "#CBD5E1" : "#475569",
                  textDecoration: "none",
                  cursor: link.disabled ? "not-allowed" : "pointer",
                  transition: "color 160ms ease, background 160ms ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!link.disabled) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#0F172A";
                    (e.currentTarget as HTMLAnchorElement).style.background = "#F1F5F9";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = link.disabled ? "#CBD5E1" : "#475569";
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                {link.label}
                {link.disabled && (
                  <span
                    style={{
                      marginLeft: "6px",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: "#F5A623",
                      background: "rgba(245,166,35,0.12)",
                      padding: "1px 5px",
                      borderRadius: "4px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    SOON
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* CTA buttons */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}
            className="hidden-mobile"
          >
            <a
              href="/login"
              id="nav-login"
              style={{
                padding: "7px 16px",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#475569",
                textDecoration: "none",
                transition: "color 160ms ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#0F172A")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#475569")}
            >
              Login
            </a>
            <a href="/dashboard" id="nav-launch" className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.875rem" }}>
              Launch App
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              color: "#475569",
            }}
            className="show-mobile"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
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
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "fixed",
              top: "64px",
              left: 0,
              right: 0,
              zIndex: 99,
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(16px)",
              borderBottom: "1px solid rgba(226,232,240,0.9)",
              padding: "16px 24px 24px",
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.disabled ? undefined : link.href}
                  onClick={() => !link.disabled && setMobileOpen(false)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: link.disabled ? "#CBD5E1" : "#334155",
                    textDecoration: "none",
                    cursor: link.disabled ? "not-allowed" : "pointer",
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div style={{ display: "flex", gap: "10px" }}>
              <a href="/login" className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                Login
              </a>
              <a href="/dashboard" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                Launch App
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
