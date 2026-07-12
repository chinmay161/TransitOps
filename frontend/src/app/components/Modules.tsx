"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Lock, GridFour, Truck, Users,
  MapTrifold, Wrench, CurrencyDollar, ChartBar,
} from "@phosphor-icons/react";

const modules = [
  { id: "auth",      icon: <Lock size={24} weight="duotone" />,         label: "Authentication",      desc: "Secure role-based access",        color: "#64748B" },
  { id: "dashboard", icon: <GridFour size={24} weight="duotone" />,     label: "Dashboard",           desc: "Fleet KPIs at a glance",          color: "#F5A623" },
  { id: "vehicles",  icon: <Truck size={24} weight="duotone" />,        label: "Vehicle Registry",    desc: "Full vehicle lifecycle",           color: "#6366F1" },
  { id: "drivers",   icon: <Users size={24} weight="duotone" />,        label: "Driver Management",   desc: "Compliance & scheduling",         color: "#10B981" },
  { id: "trips",     icon: <MapTrifold size={24} weight="duotone" />,   label: "Trip Management",     desc: "Dispatch & tracking",             color: "#0EA5E9" },
  { id: "maint",     icon: <Wrench size={24} weight="duotone" />,       label: "Maintenance",         desc: "Service & conflict checks",       color: "#EF4444" },
  { id: "fuel",      icon: <CurrencyDollar size={24} weight="duotone" />,label: "Fuel & Expenses",   desc: "Cost monitoring",                 color: "#F59E0B" },
  { id: "reports",   icon: <ChartBar size={24} weight="duotone" />,     label: "Reports & Analytics", desc: "Insights & exports",              color: "#8B5CF6" },
];

export default function Modules() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="modules" style={{ padding: "96px 24px", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          style={{ textAlign: "center", marginBottom: "56px" }}
        >
          <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.375rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.15 }}>
            Eight Integrated Modules
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: "360px", margin: "0 auto" }}>
            Each module is fully integrated — data flows automatically across the platform.
          </p>
        </motion.div>

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}
          className="modules-grid"
        >
          {modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              id={`module-${mod.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "24px 20px",
                cursor: "default",
                transition: "transform 200ms cubic-bezier(0.23,1,0.32,1), background 180ms ease, border-color 180ms ease, box-shadow 200ms ease",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(-4px)";
                el.style.background = "var(--bg-card-hover)";
                el.style.borderColor = `${mod.color}40`;
                el.style.boxShadow = `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${mod.color}30`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(0)";
                el.style.background = "var(--bg-card)";
                el.style.borderColor = "rgba(255,255,255,0.07)";
                el.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "46px", height: "46px", borderRadius: "12px",
                  background: `${mod.color}14`,
                  border: `1px solid ${mod.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: mod.color,
                }}
              >
                {mod.icon}
              </div>
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px", letterSpacing: "-0.01em" }}>{mod.label}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{mod.desc}</p>
              </div>
              {/* Subtle dot */}
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: mod.color, opacity: 0.5, marginTop: "auto" }} />
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .modules-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .modules-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
