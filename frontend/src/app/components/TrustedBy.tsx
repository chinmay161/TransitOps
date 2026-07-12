"use client";

import { motion, useReducedMotion } from "motion/react";

// Real logistics company SVG monograms (invented brands for demo)
const companies = [
  {
    id: "nexus-logistics",
    name: "NexusLogistics",
    svg: (
      <svg width="90" height="28" viewBox="0 0 90 28" fill="none">
        <text x="0" y="21" fontFamily="system-ui" fontWeight="700" fontSize="14" fill="currentColor" letterSpacing="-0.5">NexusLogistics</text>
      </svg>
    ),
  },
  {
    id: "swift-freight",
    name: "SwiftFreight",
    svg: (
      <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
        <polygon points="8,4 14,14 8,24 2,14" fill="currentColor" fillOpacity="0.8"/>
        <text x="18" y="20" fontFamily="system-ui" fontWeight="700" fontSize="13" fill="currentColor" letterSpacing="-0.3">SwiftFreight</text>
      </svg>
    ),
  },
  {
    id: "apex-transport",
    name: "ApexTransport",
    svg: (
      <svg width="88" height="28" viewBox="0 0 88 28" fill="none">
        <rect x="0" y="8" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.85"/>
        <text x="16" y="20" fontFamily="system-ui" fontWeight="700" fontSize="13" fill="currentColor" letterSpacing="-0.3">ApexTransport</text>
      </svg>
    ),
  },
  {
    id: "meridian-fleet",
    name: "MeridianFleet",
    svg: (
      <svg width="85" height="28" viewBox="0 0 85 28" fill="none">
        <circle cx="10" cy="14" r="8" stroke="currentColor" strokeWidth="2.5" fill="none"/>
        <line x1="10" y1="6" x2="10" y2="22" stroke="currentColor" strokeWidth="2"/>
        <text x="24" y="20" fontFamily="system-ui" fontWeight="700" fontSize="13" fill="currentColor" letterSpacing="-0.3">MeridianFleet</text>
      </svg>
    ),
  },
  {
    id: "ironroute",
    name: "IronRoute",
    svg: (
      <svg width="70" height="28" viewBox="0 0 70 28" fill="none">
        <path d="M2 14L8 6L14 14L8 22L2 14Z" fill="currentColor" fillOpacity="0.9"/>
        <text x="19" y="20" fontFamily="system-ui" fontWeight="700" fontSize="14" fill="currentColor" letterSpacing="-0.3">IronRoute</text>
      </svg>
    ),
  },
  {
    id: "vantage-cargo",
    name: "VantageCargo",
    svg: (
      <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
        <path d="M2 8h10l4 6-4 6H2l4-6-4-6z" fill="currentColor" fillOpacity="0.75"/>
        <text x="18" y="20" fontFamily="system-ui" fontWeight="700" fontSize="13" fill="currentColor" letterSpacing="-0.3">VantageCargo</text>
      </svg>
    ),
  },
];

// Duplicate for seamless marquee
const allCompanies = [...companies, ...companies];

export default function TrustedBy() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="trusted-by"
      style={{
        padding: "60px 0",
        borderTop: "1px solid #F1F5F9",
        borderBottom: "1px solid #F1F5F9",
        background: "#FAFCFF",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        style={{
          textAlign: "center",
          marginBottom: "36px",
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "#94A3B8",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Trusted by logistics teams worldwide
      </motion.div>

      {/* Marquee */}
      <div style={{ position: "relative" }}>
        {/* Fade edges */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "120px",
            background: "linear-gradient(to right, #FAFCFF, transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "120px",
            background: "linear-gradient(to left, #FAFCFF, transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "64px",
            alignItems: "center",
            width: "max-content",
          }}
          className={reduceMotion ? "" : "animate-marquee"}
        >
          {allCompanies.map((co, i) => (
            <div
              key={`${co.id}-${i}`}
              style={{
                color: "#CBD5E1",
                filter: "grayscale(1)",
                opacity: 0.7,
                transition: "opacity 200ms ease, color 200ms ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.opacity = "1";
                (e.currentTarget as HTMLDivElement).style.color = "#94A3B8";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.opacity = "0.7";
                (e.currentTarget as HTMLDivElement).style.color = "#CBD5E1";
              }}
            >
              {co.svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
