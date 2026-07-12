"use client";

import { motion, useReducedMotion } from "motion/react";

const companies = [
  { id: "nexus", name: "NexusLogistics" },
  { id: "swift", name: "SwiftFreight" },
  { id: "apex", name: "ApexTransport" },
  { id: "meridian", name: "MeridianFleet" },
  { id: "iron", name: "IronRoute" },
  { id: "vantage", name: "VantageCargo" },
  { id: "atlas", name: "AtlasShipping" },
  { id: "core", name: "CoreLogix" },
];

// Simple geometric SVG monograms
const Monogram = ({ name, id }: { name: string; id: string }) => {
  const initial = name[0];
  const shapes: Record<string, React.ReactNode> = {
    nexus: <><polygon points="8,3 13,3 18,12 13,21 8,21 3,12" fill="none" stroke="currentColor" strokeWidth="1.5"/><text x="10.5" y="16" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor">N</text></>,
    swift: <><circle cx="10" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/><text x="10" y="16" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor">S</text></>,
    apex: <><polygon points="10,3 18,18 2,18" fill="none" stroke="currentColor" strokeWidth="1.5"/><text x="10" y="16.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor">A</text></>,
    meridian: <><rect x="3" y="5" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><text x="10" y="16" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor">M</text></>,
    iron: <><path d="M3 12h14M10 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
    vantage: <><path d="M3 5l7 12 7-12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    atlas: <><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M3 10h14M10 3c-3 3-3 10 0 14M10 3c3 3 3 10 0 14" stroke="currentColor" strokeWidth="1" opacity="0.7"/></>,
    core: <><rect x="4" y="4" width="12" height="12" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><rect x="7" y="7" width="6" height="6" rx="3" fill="currentColor" opacity="0.6"/></>,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
        {shapes[id] ?? <text x="10" y="15" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor">{initial}</text>}
      </svg>
      <span style={{ fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "-0.01em" }}>{name}</span>
    </div>
  );
};

const allCompanies = [...companies, ...companies];

export default function TrustedBy() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="trusted-by"
      style={{
        padding: "48px 0",
        background: "var(--bg-surface)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <motion.p
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: "center",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: "28px",
        }}
      >
        Trusted by logistics teams worldwide
      </motion.p>

      <div style={{ position: "relative" }}>
        {/* Fade masks */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to right, var(--bg-surface), transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "120px", background: "linear-gradient(to left, var(--bg-surface), transparent)", zIndex: 2, pointerEvents: "none" }} />

        <div
          style={{ display: "flex", gap: "56px", alignItems: "center", width: "max-content" }}
          className={reduceMotion ? "" : "animate-marquee"}
        >
          {allCompanies.map((co, i) => (
            <div
              key={`${co.id}-${i}`}
              style={{
                color: "rgba(255,255,255,0.2)",
                transition: "color 200ms ease",
                flexShrink: 0,
                cursor: "default",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.color = "rgba(255,255,255,0.5)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.color = "rgba(255,255,255,0.2)")}
            >
              <Monogram name={co.name} id={co.id} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
