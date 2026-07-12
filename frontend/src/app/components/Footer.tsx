"use client";

import { ReactNode } from "react";
import { GithubLogo, BookOpen, ShieldCheck, Lifebuoy, InstagramLogo, TwitterLogo, YoutubeLogo } from "@phosphor-icons/react";

interface FooterLink {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

const cols: FooterColumn[] = [
  {
    heading: "Platform",
    links: [
      { label: "About", href: "#" },
      { label: "Resources", href: "#" },
      { label: "Status", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Pricing", href: "#pricing" },
      { label: "Status", href: "#" },
      { label: "Documentation", href: "#docs" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Social Media", href: "#", icon: <InstagramLogo size={13} /> },
      { label: "Terms & Conditions", href: "#", icon: <ShieldCheck size={13} /> },
      { label: "Privacy Policy", href: "#", icon: <ShieldCheck size={13} /> },
    ],
  },
];

const socials = [
  { id: "instagram", icon: <InstagramLogo size={16} />, href: "#" },
  { id: "twitter",   icon: <TwitterLogo size={16} />,   href: "#" },
  { id: "youtube",   icon: <YoutubeLogo size={16} />,   href: "#" },
  { id: "github",    icon: <GithubLogo size={16} />,    href: "https://github.com" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#040810",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "60px 24px 28px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Top: Logo + cols + socials */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr auto", gap: "48px", marginBottom: "52px", alignItems: "start" }} className="footer-grid">
          {/* Logo + tagline */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "12px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg, #F5A623 0%, #D4891A 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <rect x="1" y="8" width="11" height="7" rx="1.5" fill="white" fillOpacity="0.95" />
                  <path d="M12 10h3.5l2.5 3v2H12V10z" fill="white" fillOpacity="0.85" />
                  <circle cx="5" cy="15.5" r="1.5" fill="#D4891A" />
                  <circle cx="14.5" cy="15.5" r="1.5" fill="#D4891A" />
                </svg>
              </div>
              <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#F0F4FF", letterSpacing: "-0.02em" }}>TransitOps</span>
            </div>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", lineHeight: 1.6, maxWidth: "200px" }}>
              Smart transport operations platform for modern fleet management.
            </p>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                {col.heading}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{ fontSize: "0.8375rem", color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", transition: "color 150ms ease" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
                  >
                    {link.icon}
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Social icons */}
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
              Follow
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  id={`footer-${s.id}`}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    transition: "color 150ms ease, border-color 150ms ease, background 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = "#F5A623";
                    el.style.borderColor = "rgba(245,166,35,0.3)";
                    el.style.background = "rgba(245,166,35,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = "var(--text-muted)";
                    el.style.borderColor = "rgba(255,255,255,0.07)";
                    el.style.background = "rgba(255,255,255,0.05)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <p style={{ fontSize: "0.775rem", color: "rgba(255,255,255,0.15)" }}>
            &copy; {year} TransitOps. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            {["Privacy", "Terms", "Support", "Legal"].map((item) => (
              <a key={item} href="#" style={{ fontSize: "0.775rem", color: "rgba(255,255,255,0.15)", textDecoration: "none", transition: "color 150ms ease" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.15)")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
