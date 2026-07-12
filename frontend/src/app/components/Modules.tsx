"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Lock,
  GridFour,
  Truck,
  Users,
  MapTrifold,
  Wrench,
  CurrencyDollar,
  ChartBar,
} from "@phosphor-icons/react";

const modules = [
  {
    id: "authentication",
    icon: <Lock size={26} weight="duotone" />,
    label: "Authentication",
    desc: "Secure role-based access",
    color: "#64748B",
    bg: "#F8FAFC",
  },
  {
    id: "dashboard",
    icon: <GridFour size={26} weight="duotone" />,
    label: "Dashboard",
    desc: "Fleet KPIs at a glance",
    color: "#F5A623",
    bg: "#FFF8EC",
  },
  {
    id: "vehicle-registry",
    icon: <Truck size={26} weight="duotone" />,
    label: "Vehicle Registry",
    desc: "Full vehicle lifecycle",
    color: "#6366F1",
    bg: "#EEF2FF",
  },
  {
    id: "driver-management",
    icon: <Users size={26} weight="duotone" />,
    label: "Driver Management",
    desc: "Compliance & scheduling",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    id: "trip-management",
    icon: <MapTrifold size={26} weight="duotone" />,
    label: "Trip Management",
    desc: "Dispatch & tracking",
    color: "#0EA5E9",
    bg: "#F0F9FF",
  },
  {
    id: "maintenance",
    icon: <Wrench size={26} weight="duotone" />,
    label: "Maintenance",
    desc: "Service & conflict checks",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  {
    id: "fuel-expenses",
    icon: <CurrencyDollar size={26} weight="duotone" />,
    label: "Fuel & Expenses",
    desc: "Cost monitoring",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    id: "reports-analytics",
    icon: <ChartBar size={26} weight="duotone" />,
    label: "Reports & Analytics",
    desc: "Insights & exports",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
];

export default function Modules() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="modules"
      style={{
        padding: "96px 24px",
        background: "#0F172A",
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
              color: "#F8FAFC",
              marginBottom: "14px",
              lineHeight: 1.15,
            }}
          >
            Eight Integrated Modules
          </h2>
          <p style={{ fontSize: "1rem", color: "#64748B", maxWidth: "380px", margin: "0 auto" }}>
            Each module is fully integrated — data flows automatically across the platform.
          </p>
        </motion.div>

        {/* 4×2 bento grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
          className="modules-grid"
        >
          {modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              id={`module-${mod.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
              style={{
                background: "#1E293B",
                borderRadius: "16px",
                padding: "28px 24px",
                border: "1px solid #334155",
                cursor: "pointer",
                transition: "transform 220ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 220ms cubic-bezier(0.23, 1, 0.32, 1), border-color 200ms ease",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(-4px)";
                el.style.boxShadow = `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${mod.color}40`;
                el.style.borderColor = `${mod.color}60`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
                el.style.borderColor = "#334155";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "13px",
                  background: mod.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: mod.color,
                }}
              >
                {mod.icon}
              </div>

              {/* Text */}
              <div>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "#F1F5F9",
                    marginBottom: "4px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {mod.label}
                </p>
                <p style={{ fontSize: "0.8125rem", color: "#64748B" }}>{mod.desc}</p>
              </div>

              {/* Subtle color dot */}
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: mod.color,
                  opacity: 0.6,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .modules-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .modules-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
