"use client";

import { motion, useReducedMotion } from "motion/react";
import { X, Check } from "@phosphor-icons/react";

const comparison = [
  {
    traditional: "Manual spreadsheets and siloed data",
    transitops: "Centralized dashboard with live sync",
  },
  {
    traditional: "Double booking and scheduling conflicts",
    transitops: "Smart validations prevent conflicts",
  },
  {
    traditional: "Missed maintenance and surprise downtime",
    transitops: "Automated maintenance scheduling",
  },
  {
    traditional: "Zero visibility into fleet performance",
    transitops: "Live fleet status and utilization",
  },
  {
    traditional: "Manual reporting taking hours",
    transitops: "Automated analytics and exports",
  },
];

export default function WhyTransitOps() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="why-transitops"
      style={{
        padding: "96px 24px",
        background: "white",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          style={{ textAlign: "center", marginBottom: "64px" }}
        >
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#0F172A",
              marginBottom: "14px",
              lineHeight: 1.15,
            }}
          >
            Why teams switch to TransitOps
          </h2>
          <p style={{ fontSize: "1rem", color: "#64748B", maxWidth: "400px", margin: "0 auto" }}>
            Purpose-built for fleet operations — not adapted from generic project management tools.
          </p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 24px rgba(15,23,42,0.08)",
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "#F8FAFC",
              borderBottom: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                padding: "18px 28px",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#94A3B8",
                borderRight: "1px solid #E2E8F0",
                letterSpacing: "0.02em",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <X size={14} weight="bold" color="#EF4444" />
              Traditional Fleet Management
            </div>
            <div
              style={{
                padding: "18px 28px",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#10B981",
                letterSpacing: "0.02em",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, rgba(16,185,129,0.04) 0%, transparent 100%)",
              }}
            >
              <Check size={14} weight="bold" color="#10B981" />
              TransitOps Platform
            </div>
          </div>

          {/* Comparison rows */}
          {comparison.map((row, i) => (
            <motion.div
              key={i}
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderBottom: i < comparison.length - 1 ? "1px solid #F1F5F9" : "none",
              }}
            >
              <div
                style={{
                  padding: "20px 28px",
                  fontSize: "0.9rem",
                  color: "#94A3B8",
                  borderRight: "1px solid #E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: i % 2 === 0 ? "white" : "#FAFCFF",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <X size={10} weight="bold" color="#EF4444" />
                </div>
                {row.traditional}
              </div>
              <div
                style={{
                  padding: "20px 28px",
                  fontSize: "0.9rem",
                  color: "#334155",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: i % 2 === 0 ? "rgba(16,185,129,0.02)" : "rgba(16,185,129,0.04)",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "rgba(16,185,129,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check size={10} weight="bold" color="#10B981" />
                </div>
                {row.transitops}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
