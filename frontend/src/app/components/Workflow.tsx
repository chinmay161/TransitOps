"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  PlusCircle, UserPlus, NavigationArrow,
  Broadcast, Wrench, GasPump, ChartDonut,
} from "@phosphor-icons/react";

const steps = [
  { id: "vehicle-reg", icon: <PlusCircle size={20} weight="duotone" />, label: "Vehicle Registration", color: "#F5A623" },
  { id: "driver-assign", icon: <UserPlus size={20} weight="duotone" />, label: "Driver Assignment", color: "#10B981" },
  { id: "trip-dispatch", icon: <NavigationArrow size={20} weight="duotone" />, label: "Trip Dispatch", color: "#6366F1" },
  { id: "live-ops", icon: <Broadcast size={20} weight="duotone" />, label: "Live Operations", color: "#0EA5E9" },
  { id: "maintenance", icon: <Wrench size={20} weight="duotone" />, label: "Maintenance", color: "#EF4444" },
  { id: "fuel-log", icon: <GasPump size={20} weight="duotone" />, label: "Fuel Logging", color: "#F59E0B" },
  { id: "analytics", icon: <ChartDonut size={20} weight="duotone" />, label: "Analytics", color: "#8B5CF6" },
];

export default function Workflow() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="workflow" style={{ padding: "96px 24px", background: "var(--bg-surface)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          style={{ textAlign: "center", marginBottom: "64px" }}
        >
          <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.375rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.15 }}>
            Complete Fleet Lifecycle
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: "380px", margin: "0 auto" }}>
            Every step connected, automated, and tracked end-to-end.
          </p>
        </motion.div>

        {/* Steps with amber connector line */}
        <div style={{ position: "relative" }}>
          {/* Connector line */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "calc(100% / 14)",
              right: "calc(100% / 14)",
              height: "1px",
              background: "linear-gradient(to right, #F5A623, #8B5CF6)",
              opacity: 0.25,
            }}
            className="workflow-line"
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }} className="workflow-grid">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                id={`workflow-${step.id}`}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: [0.23, 1, 0.32, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}
              >
                {/* Step bubble */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: `${step.color}14`,
                    border: `1.5px solid ${step.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: step.color,
                    position: "relative",
                    zIndex: 1,
                    boxShadow: `0 0 16px ${step.color}20`,
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                  {/* Step number badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: step.color,
                      color: "#050A14",
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </div>
                </div>
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                  {step.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .workflow-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .workflow-line { display: none; }
        }
        @media (max-width: 480px) {
          .workflow-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
