"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  PlusCircle,
  UserPlus,
  NavigationArrow,
  Broadcast,
  Wrench,
  GasPump,
  ChartDonut,
} from "@phosphor-icons/react";

const steps = [
  {
    id: "vehicle-registration",
    icon: <PlusCircle size={22} weight="duotone" />,
    label: "Vehicle Registration",
    desc: "Add vehicles with full specs and capacity",
    color: "#F5A623",
    bg: "#FFF8EC",
  },
  {
    id: "driver-assignment",
    icon: <UserPlus size={22} weight="duotone" />,
    label: "Driver Assignment",
    desc: "Assign licensed, compliant drivers",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    id: "trip-dispatch",
    icon: <NavigationArrow size={22} weight="duotone" />,
    label: "Trip Dispatch",
    desc: "Smart dispatch with auto-validation",
    color: "#6366F1",
    bg: "#EEF2FF",
  },
  {
    id: "live-operations",
    icon: <Broadcast size={22} weight="duotone" />,
    label: "Live Operations",
    desc: "Real-time fleet status monitoring",
    color: "#0EA5E9",
    bg: "#F0F9FF",
  },
  {
    id: "maintenance",
    icon: <Wrench size={22} weight="duotone" />,
    label: "Maintenance",
    desc: "Service scheduling and conflict prevention",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  {
    id: "fuel-logging",
    icon: <GasPump size={22} weight="duotone" />,
    label: "Fuel Logging",
    desc: "Expense and efficiency tracking",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    id: "analytics",
    icon: <ChartDonut size={22} weight="duotone" />,
    label: "Analytics",
    desc: "KPIs, reports, and actionable insights",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
];

export default function Workflow() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="workflow"
      style={{
        background: "#0F172A",
        padding: "96px 24px",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          style={{ marginBottom: "64px", textAlign: "center" }}
        >
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#F8FAFC",
              marginBottom: "14px",
              lineHeight: 1.15,
            }}
          >
            Complete Fleet Lifecycle
          </h2>
          <p style={{ fontSize: "1rem", color: "#64748B", maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
            From registration to reporting — every step connected, automated, and tracked.
          </p>
        </motion.div>

        {/* Steps — horizontal scroll on mobile, grid on desktop */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0",
            alignItems: "start",
            position: "relative",
          }}
          className="workflow-grid"
        >
          {steps.map((step, i) => (
            <div key={step.id} style={{ display: "flex", alignItems: "flex-start", gap: "0" }}>
              <motion.div
                id={`workflow-${step.id}`}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  flex: 1,
                  padding: "0 8px",
                }}
              >
                {/* Icon bubble */}
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: step.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: step.color,
                    marginBottom: "14px",
                    border: `1px solid ${step.color}30`,
                    boxShadow: `0 0 0 4px ${step.color}10`,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {step.icon}
                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: step.color,
                      color: "white",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    color: "#E2E8F0",
                    marginBottom: "6px",
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </p>
                <p style={{ fontSize: "0.725rem", color: "#475569", lineHeight: 1.4 }}>{step.desc}</p>
              </motion.div>

              {/* Connector arrow between steps */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "22px",
                    flexShrink: 0,
                    width: "0",
                    position: "relative",
                    zIndex: 0,
                  }}
                >
                  <svg
                    width="24"
                    height="16"
                    viewBox="0 0 24 16"
                    fill="none"
                    style={{ position: "absolute", left: "-12px" }}
                  >
                    <path
                      d="M0 8H20M16 4L20 8L16 12"
                      stroke="#334155"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .workflow-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 540px) {
          .workflow-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
