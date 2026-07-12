"use client";

import { motion, useReducedMotion } from "motion/react";
import { CheckCircle, ShieldCheck } from "@phosphor-icons/react";

const rules = [
  { id: "no-double", title: "Prevent double vehicle assignment", desc: "Vehicles cannot be dispatched to two trips simultaneously — enforced automatically." },
  { id: "expired-license", title: "Block expired licenses", desc: "Drivers with expired licenses are automatically excluded from new dispatch assignments." },
  { id: "overload", title: "Prevent overload dispatch", desc: "Cargo weight and passenger counts validated against vehicle capacity limits." },
  { id: "status-transitions", title: "Automatic status transitions", desc: "Vehicle and trip statuses update automatically — no manual updates needed." },
  { id: "maintenance-aware", title: "Maintenance-aware scheduling", desc: "Vehicles scheduled for service are blocked from new dispatches until maintenance completes." },
  { id: "realtime-analytics", title: "Fleet analytics in real time", desc: "KPIs, utilization, and cost data update live as operations progress." },
];

export default function BusinessRules() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="business-rules" style={{ padding: "96px 24px", background: "var(--bg-surface)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }} className="rules-grid">
          {/* Left sticky header */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: "sticky", top: "80px" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: "7px",
                padding: "5px 12px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#10B981",
                letterSpacing: "0.05em",
                marginBottom: "22px",
              }}
            >
              <ShieldCheck size={13} weight="fill" />
              BUILT-IN RULES
            </div>

            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.375rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "18px", lineHeight: 1.15 }}>
              Built-in Operational Intelligence
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.65, maxWidth: "380px", marginBottom: "36px" }}>
              TransitOps enforces operational constraints automatically, eliminating human error and protecting your fleet from costly mistakes.
            </p>

            <div
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)",
                borderRadius: "14px",
                padding: "22px 24px",
              }}
            >
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#10B981", letterSpacing: "-0.04em", marginBottom: "4px" }}>6 Rules</div>
              <div style={{ fontSize: "0.875rem", color: "rgba(16,185,129,0.7)", fontWeight: 500 }}>
                Enforced automatically on every operation — no configuration required.
              </div>
            </div>
          </motion.div>

          {/* Right: rule cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {rules.map((rule, i) => (
              <motion.div
                key={rule.id}
                id={`rule-${rule.id}`}
                initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.23, 1, 0.32, 1] }}
                className="card-hover"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                  cursor: "default",
                }}
              >
                <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981", flexShrink: 0, marginTop: "1px" }}>
                  <CheckCircle size={14} weight="fill" />
                </div>
                <div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{rule.title}</p>
                  <p style={{ fontSize: "0.835rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>{rule.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .rules-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .rules-grid > :first-child { position: static !important; }
        }
      `}</style>
    </section>
  );
}
