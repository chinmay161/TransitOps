"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Truck,
  IdentificationCard,
  NavigationArrow,
  Wrench,
  CurrencyDollar,
  ChartBar,
} from "@phosphor-icons/react";

const features = [
  {
    id: "fleet-management",
    icon: <Truck size={22} weight="duotone" />,
    color: "#F5A623",
    title: "Fleet Management",
    description: "Track vehicles, status, capacity, odometer readings, and full lifecycle history in one unified registry.",
    tag: "Core",
  },
  {
    id: "driver-management",
    icon: <IdentificationCard size={22} weight="duotone" />,
    color: "#10B981",
    title: "Driver Management",
    description: "Manage licenses, safety scores, availability, and compliance checks with automated expiry alerts.",
    tag: "Safety",
  },
  {
    id: "trip-dispatch",
    icon: <NavigationArrow size={22} weight="duotone" />,
    color: "#6366F1",
    title: "Smart Trip Dispatch",
    description: "Assign vehicles and drivers with automatic conflict detection, load validation, and route optimization.",
    tag: "Automation",
  },
  {
    id: "maintenance",
    icon: <Wrench size={22} weight="duotone" />,
    color: "#EF4444",
    title: "Maintenance Management",
    description: "Schedule and track servicing to prevent unplanned downtime. Conflicts automatically blocked from dispatch.",
    tag: "Scheduling",
  },
  {
    id: "fuel-expenses",
    icon: <CurrencyDollar size={22} weight="duotone" />,
    color: "#F59E0B",
    title: "Fuel & Expense Tracking",
    description: "Monitor operational costs, fuel consumption, and efficiency metrics across your entire fleet.",
    tag: "Finance",
  },
  {
    id: "analytics",
    icon: <ChartBar size={22} weight="duotone" />,
    color: "#0EA5E9",
    title: "Analytics & Reports",
    description: "Fleet utilization, ROI analysis, operational cost trends, KPI dashboards, and exportable reports.",
    tag: "Insights",
  },
];

export default function Features() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="features"
      style={{ padding: "96px 24px", background: "var(--bg-base)" }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header — left-aligned */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          style={{ marginBottom: "56px", maxWidth: "560px" }}
        >
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.375rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              marginBottom: "14px",
              lineHeight: 1.15,
            }}
          >
            Everything your fleet operation needs.
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
            From vehicle registration to analytics — every stage covered with built-in business rules.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              id={`feature-${f.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
              className="card-hover"
              style={{
                background: "var(--bg-card)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "24px",
                cursor: "default",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Left color accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "3px",
                  height: "100%",
                  background: f.color,
                  borderRadius: "14px 0 0 14px",
                  opacity: 0.6,
                }}
              />

              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "11px",
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}28`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: f.color,
                }}
              >
                {f.icon}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                    {f.title}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: f.color,
                      background: `${f.color}18`,
                      padding: "3px 7px",
                      borderRadius: "5px",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.tag}
                  </span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
