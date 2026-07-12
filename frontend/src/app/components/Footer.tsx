"use client";

import {
  GithubLogo,
  BookOpen,
  ShieldCheck,
  Lifebuoy,
  Star,
} from "@phosphor-icons/react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Documentation", href: "#docs", icon: <BookOpen size={14} /> },
  { label: "Privacy", href: "#privacy", icon: <ShieldCheck size={14} /> },
  { label: "Support", href: "#support", icon: <Lifebuoy size={14} /> },
  { label: "GitHub", href: "https://github.com", icon: <GithubLogo size={14} />, external: true },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#0A0F1A",
        borderTop: "1px solid #1E293B",
        padding: "48px 24px 32px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "36px",
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "40px",
            flexWrap: "wrap",
          }}
        >
          {/* Logo + tagline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #F5A623 0%, #D4891A 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                  <rect x="1" y="8" width="11" height="7" rx="1.5" fill="white" fillOpacity="0.95" />
                  <path d="M12 10h3.5l2.5 3v2H12V10z" fill="white" fillOpacity="0.85" />
                  <circle cx="5" cy="15.5" r="1.5" fill="#D4891A" />
                  <circle cx="14.5" cy="15.5" r="1.5" fill="#D4891A" />
                </svg>
              </div>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
                TransitOps
              </span>
            </div>
            <p style={{ fontSize: "0.8375rem", color: "#475569", maxWidth: "240px", lineHeight: 1.55 }}>
              Smart transport operations platform for modern fleet management.
            </p>

            {/* GitHub star button */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                background: "#1E293B",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "7px 12px",
                fontSize: "0.8125rem",
                color: "#94A3B8",
                textDecoration: "none",
                width: "fit-content",
                transition: "border-color 160ms ease, color 160ms ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "#F5A623";
                el.style.color = "#F5A623";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "#334155";
                el.style.color = "#94A3B8";
              }}
            >
              <GithubLogo size={14} />
              Star on GitHub
              <Star size={12} />
            </a>
          </div>

          {/* Navigation links */}
          <nav
            style={{
              display: "flex",
              gap: "32px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                Platform
              </p>
              {links.slice(0, 2).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  style={{
                    fontSize: "0.875rem",
                    color: "#64748B",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "color 160ms ease",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#94A3B8")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748B")}
                >
                  {link.icon}
                  {link.label}
                </a>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                Company
              </p>
              {links.slice(2).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  style={{
                    fontSize: "0.875rem",
                    color: "#64748B",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "color 160ms ease",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#94A3B8")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748B")}
                >
                  {link.icon}
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* Bottom row */}
        <div
          style={{
            borderTop: "1px solid #1E293B",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <p style={{ fontSize: "0.8125rem", color: "#334155" }}>
            &copy; {year} TransitOps. All rights reserved.
          </p>
          <p style={{ fontSize: "0.8125rem", color: "#334155" }}>
            Built for modern logistics teams.
          </p>
        </div>
      </div>
    </footer>
  );
}
