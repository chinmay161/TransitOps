"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, useInView } from "motion/react";

const stats = [
  {
    id: "vehicles-managed",
    value: 53,
    suffix: "+",
    label: "Vehicles Managed",
    desc: "Across all active fleets",
    color: "#F5A623",
  },
  {
    id: "trips-completed",
    value: 1200,
    suffix: "+",
    label: "Trips Completed",
    desc: "On-time and tracked",
    color: "#10B981",
  },
  {
    id: "fleet-utilization",
    value: 81,
    suffix: "%",
    label: "Fleet Utilization",
    desc: "Average across fleets",
    color: "#6366F1",
  },
  {
    id: "operational-accuracy",
    value: 99.9,
    suffix: "%",
    label: "Operational Accuracy",
    desc: "Built-in validations",
    color: "#0EA5E9",
  },
];

function AnimatedCounter({
  value,
  suffix,
  color,
  isVisible,
}: {
  value: number;
  suffix: string;
  color: string;
  isVisible: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1600;
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(parseFloat((eased * value).toFixed(value % 1 === 0 ? 0 : 1)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [isVisible, value]);

  return (
    <span
      style={{
        fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
        fontWeight: 800,
        letterSpacing: "-0.04em",
        color: color,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  return (
    <section
      id="stats"
      style={{
        padding: "96px 24px",
        background: "#FAFCFF",
        borderTop: "1px solid #F1F5F9",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
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
            Numbers that move your fleet forward.
          </h2>
          <p style={{ fontSize: "1rem", color: "#64748B", maxWidth: "380px", margin: "0 auto" }}>
            Real performance metrics from active TransitOps deployments.
          </p>
        </motion.div>

        <div
          ref={containerRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.id}
              id={`stat-${stat.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "32px 28px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top accent bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: `linear-gradient(to right, ${stat.color}, transparent)`,
                }}
              />

              {reduceMotion ? (
                <span
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    color: stat.color,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                  {stat.suffix}
                </span>
              ) : (
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  color={stat.color}
                  isVisible={isInView}
                />
              )}

              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  letterSpacing: "-0.01em",
                  marginTop: "4px",
                }}
              >
                {stat.label}
              </p>
              <p style={{ fontSize: "0.85rem", color: "#94A3B8" }}>{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
