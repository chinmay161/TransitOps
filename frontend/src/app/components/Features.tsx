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
    icon: <Truck size={24} weight="duotone" />,
    iconColor: "#F5A623",
    iconBg: "rgba(245,166,35,0.1)",
    title: "Fleet Management",
    description:
      "Track vehicles, status, capacity, odometer readings, and full lifecycle history in one unified registry.",
    tag: "Core",
    tagColor: "#F5A623",
    tagBg: "rgba(245,166,35,0.1)",
  },
  {
    id: "driver-management",
    icon: <IdentificationCard size={24} weight="duotone" />,
    iconColor: "#10B981",
    iconBg: "rgba(16,185,129,0.1)",
    title: "Driver Management",
    description:
      "Manage licenses, safety scores, availability, and compliance checks with automated expiry alerts.",
    tag: "Safety",
    tagColor: "#10B981",
    tagBg: "rgba(16,185,129,0.1)",
  },
  {
    id: "trip-dispatch",
    icon: <NavigationArrow size={24} weight="duotone" />,
    iconColor: "#6366F1",
    iconBg: "rgba(99,102,241,0.1)",
    title: "Smart Trip Dispatch",
    description:
      "Assign vehicles and drivers with automatic conflict detection, load validation, and route optimization.",
    tag: "Automation",
    tagColor: "#6366F1",
    tagBg: "rgba(99,102,241,0.1)",
  },
  {
    id: "maintenance",
    icon: <Wrench size={24} weight="duotone" />,
    iconColor: "#EF4444",
    iconBg: "rgba(239,68,68,0.1)",
    title: "Maintenance Management",
    description:
      "Schedule and track servicing to prevent unplanned downtime. Conflicts automatically blocked from dispatch.",
    tag: "Scheduling",
    tagColor: "#EF4444",
    tagBg: "rgba(239,68,68,0.1)",
  },
  {
    id: "fuel-expenses",
    icon: <CurrencyDollar size={24} weight="duotone" />,
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.1)",
    title: "Fuel & Expense Tracking",
    description:
      "Monitor operational costs, fuel consumption, and efficiency metrics across your entire fleet.",
    tag: "Finance",
    tagColor: "#F59E0B",
    tagBg: "rgba(245,158,11,0.1)",
  },
  {
    id: "analytics",
    icon: <ChartBar size={24} weight="duotone" />,
    iconColor: "#0EA5E9",
    iconBg: "rgba(14,165,233,0.1)",
    title: "Analytics & Reports",
    description:
      "Fleet utilization, ROI analysis, operational cost trends, KPI dashboards, and exportable reports.",
    tag: "Insights",
    tagColor: "#0EA5E9",
    tagBg: "rgba(14,165,233,0.1)",
  },
];

export default function Features() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="features"
      style={{
        padding: "96px 24px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      {/* Section header */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        style={{ marginBottom: "64px" }}
      >
        <h2
          style={{
            fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#0F172A",
            marginBottom: "16px",
            lineHeight: 1.15,
          }}
        >
          Everything your fleet operation needs.
        </h2>
        <p
          style={{
            fontSize: "1.0625rem",
            color: "#64748B",
            maxWidth: "480px",
            lineHeight: 1.65,
          }}
        >
          From vehicle registration to analytics, TransitOps covers every stage of fleet operations with built-in business rules.
        </p>
      </motion.div>

      {/* Features grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.id}
            id={`feature-${feature.id}`}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.55,
              delay: i * 0.06,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="card-hover"
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: feature.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: feature.iconColor,
              }}
            >
              {feature.icon}
            </div>

            {/* Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    letterSpacing: "-0.015em",
                  }}
                >
                  {feature.title}
                </h3>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: feature.tagColor,
                    background: feature.tagBg,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {feature.tag}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#64748B",
                  lineHeight: 1.6,
                }}
              >
                {feature.description}
              </p>
            </div>

            {/* Bottom accent line on hover — via border trick */}
            <div
              style={{
                height: "2px",
                borderRadius: "2px",
                background: `linear-gradient(to right, ${feature.iconColor}, transparent)`,
                opacity: 0.3,
                marginTop: "auto",
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
