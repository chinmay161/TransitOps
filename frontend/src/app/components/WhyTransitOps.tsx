"use client";

import { motion, useReducedMotion } from "motion/react";
import { X, Check } from "@phosphor-icons/react";

const rows = [
  { old: "Manual spreadsheets and siloed data",       new: "Centralized dashboard with live sync" },
  { old: "Double booking and scheduling conflicts",   new: "Smart validations prevent conflicts" },
  { old: "Missed maintenance, surprise downtime",    new: "Automated maintenance scheduling" },
  { old: "Zero visibility into fleet performance",   new: "Live fleet status and utilization" },
  { old: "Manual reporting taking hours",            new: "Automated analytics and exports" },
];

export default function WhyTransitOps() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="why-transitops" style={{ padding: "96px 24px", background: "var(--bg-surface)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          style={{ textAlign: "center", marginBottom: "56px" }}
        >
          <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.375rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.15 }}>
            Why teams switch to TransitOps
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: "380px", margin: "0 auto" }}>
            Purpose-built for fleet operations — not adapted from generic tools.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
        >
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg-card)" }}>
            <div style={{ padding: "16px 24px", fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-muted)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "7px" }}>
              <X size={13} weight="bold" color="#EF4444" /> Traditional Management
            </div>
            <div style={{ padding: "16px 24px", fontSize: "0.8125rem", fontWeight: 700, color: "#10B981", display: "flex", alignItems: "center", gap: "7px" }}>
              <Check size={13} weight="bold" color="#10B981" /> TransitOps
            </div>
          </div>

          {rows.map((row, i) => (
            <motion.div
              key={i}
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div style={{ padding: "18px 24px", fontSize: "0.875rem", color: "var(--text-muted)", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px", background: i % 2 === 0 ? "var(--bg-card)" : "rgba(255,255,255,0.02)" }}>
                <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <X size={9} weight="bold" color="#EF4444" />
                </div>
                {row.old}
              </div>
              <div style={{ padding: "18px 24px", fontSize: "0.875rem", color: "var(--text-primary)", fontWeight: 500, display: "flex", alignItems: "center", gap: "10px", background: i % 2 === 0 ? "rgba(16,185,129,0.04)" : "rgba(16,185,129,0.06)" }}>
                <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(16,185,129,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={9} weight="bold" color="#10B981" />
                </div>
                {row.new}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
