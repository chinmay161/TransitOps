"use client";

import { motion, useReducedMotion } from "motion/react";
import { CheckCircle } from "@phosphor-icons/react";

const rules = [
  {
    id: "no-double-assignment",
    title: "Prevent double vehicle assignment",
    desc: "Vehicles cannot be dispatched to two trips simultaneously — enforced automatically.",
  },
  {
    id: "block-expired-licenses",
    title: "Block expired licenses",
    desc: "Drivers with expired licenses are automatically excluded from new dispatch assignments.",
  },
  {
    id: "prevent-overload",
    title: "Prevent overload dispatch",
    desc: "Cargo weight and passenger counts are validated against vehicle capacity limits.",
  },
  {
    id: "status-transitions",
    title: "Automatic status transitions",
    desc: "Vehicle and trip statuses update automatically based on operations — no manual updates needed.",
  },
  {
    id: "maintenance-aware",
    title: "Maintenance-aware scheduling",
    desc: "Vehicles scheduled for service are blocked from new dispatches until maintenance is complete.",
  },
  {
    id: "realtime-analytics",
    title: "Fleet analytics in real time",
    desc: "KPIs, utilization, and cost data update live as operations progress across your fleet.",
  },
];

export default function BusinessRules() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="business-rules"
      style={{
        padding: "96px 24px",
        background: "white",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Two-column layout: headline left, rules right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "start",
          }}
          className="rules-grid"
        >
          {/* Left: sticky header */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: "sticky", top: "96px" }}
          >
            {/* Decorative accent */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "0.775rem",
                fontWeight: 600,
                color: "#059669",
                letterSpacing: "0.04em",
                marginBottom: "24px",
              }}
            >
              <CheckCircle size={14} weight="fill" />
              BUILT-IN RULES
            </div>

            <h2
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#0F172A",
                marginBottom: "20px",
                lineHeight: 1.15,
              }}
            >
              Built-in Operational Intelligence
            </h2>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "#64748B",
                lineHeight: 1.65,
                maxWidth: "400px",
                marginBottom: "36px",
              }}
            >
              TransitOps enforces operational constraints automatically, eliminating human error and protecting your fleet from costly mistakes.
            </p>

            {/* Visual accent */}
            <div
              style={{
                background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
                borderRadius: "16px",
                padding: "24px",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "#10B981",
                  letterSpacing: "-0.04em",
                  marginBottom: "4px",
                }}
              >
                6 Rules
              </div>
              <div style={{ fontSize: "0.875rem", color: "#065F46", fontWeight: 500 }}>
                Enforced automatically on every operation — no configuration required.
              </div>
            </div>
          </motion.div>

          {/* Right: rule list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {rules.map((rule, i) => (
              <motion.div
                key={rule.id}
                id={`rule-${rule.id}`}
                initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.23, 1, 0.32, 1] }}
                className="card-hover"
                style={{
                  background: "#FAFCFF",
                  borderRadius: "14px",
                  padding: "20px 22px",
                  border: "1px solid #E2E8F0",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(16,185,129,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10B981",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <CheckCircle size={16} weight="fill" />
                </div>
                <div>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
                    {rule.title}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: 1.55 }}>{rule.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .rules-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .rules-grid > :first-child {
            position: static !important;
          }
        }
      `}</style>
    </section>
  );
}
