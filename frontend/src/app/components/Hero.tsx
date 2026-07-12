"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import {
  Truck,
  Users,
  Package,
  Wrench,
  GasPump,
  ChartLine,
  ArrowRight,
  Play,
} from "@phosphor-icons/react";

const floatingCards = [
  {
    id: "active-vehicles",
    icon: <Truck size={18} weight="fill" />,
    label: "Active Vehicles",
    value: "53",
    color: "#F5A623",
    bg: "#FFF8EC",
    top: "8%",
    left: "-6%",
  },
  {
    id: "drivers-duty",
    icon: <Users size={18} weight="fill" />,
    label: "Drivers On Duty",
    value: "26",
    color: "#10B981",
    bg: "#ECFDF5",
    top: "28%",
    left: "-10%",
  },
  {
    id: "active-trips",
    icon: <Package size={18} weight="fill" />,
    label: "Active Trips",
    value: "18",
    color: "#6366F1",
    bg: "#EEF2FF",
    bottom: "30%",
    left: "-8%",
  },
  {
    id: "vehicles-shop",
    icon: <Wrench size={18} weight="fill" />,
    label: "In Maintenance",
    value: "4",
    color: "#EF4444",
    bg: "#FEF2F2",
    top: "10%",
    right: "-6%",
  },
  {
    id: "fuel-efficiency",
    icon: <GasPump size={18} weight="fill" />,
    label: "Fuel Efficiency",
    value: "14.2 km/L",
    color: "#F59E0B",
    bg: "#FFFBEB",
    top: "38%",
    right: "-10%",
  },
  {
    id: "fleet-utilization",
    icon: <ChartLine size={18} weight="fill" />,
    label: "Fleet Utilization",
    value: "81%",
    color: "#10B981",
    bg: "#ECFDF5",
    bottom: "18%",
    right: "-6%",
  },
];

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "80px",
        paddingBottom: "80px",
        background: "linear-gradient(180deg, #FAFCFF 0%, #FFFFFF 60%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        className="hero-glow"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(245,166,35,0.18) 0%, transparent 70%)",
          top: "-100px",
          left: "-100px",
        }}
      />
      <div
        className="hero-glow"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          bottom: "0",
          right: "0",
        }}
      />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "56px",
          zIndex: 1,
        }}
      >
        {/* Text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "24px",
            maxWidth: "800px",
          }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(245,166,35,0.1)",
              border: "1px solid rgba(245,166,35,0.25)",
              borderRadius: "100px",
              padding: "6px 14px 6px 8px",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "#B8720F",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "#F5A623",
              }}
            >
              <Truck size={11} color="white" weight="fill" />
            </span>
            Smart Fleet Operations Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
            style={{
              fontSize: "clamp(2.4rem, 5.5vw, 3.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              color: "#0F172A",
            }}
          >
            Smart Transport Operations,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #F5A623 0%, #D4891A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Built for Modern
            </span>{" "}
            Fleet Management.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.23, 1, 0.32, 1] }}
            style={{
              fontSize: "1.0625rem",
              color: "#64748B",
              lineHeight: 1.65,
              maxWidth: "560px",
            }}
          >
            Digitize your fleet operations with a centralized platform for vehicle management,
            driver tracking, dispatch, maintenance, fuel monitoring, and operational analytics.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.23, 1, 0.32, 1] }}
            style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}
          >
            <a href="/dashboard" id="hero-launch-cta" className="btn-primary" style={{ padding: "13px 28px", fontSize: "1rem" }}>
              Launch Dashboard
              <ArrowRight size={18} weight="bold" />
            </a>
            <a href="#demo" id="hero-demo-cta" className="btn-secondary" style={{ padding: "13px 28px", fontSize: "1rem" }}>
              <Play size={16} weight="fill" />
              View Demo
            </a>
          </motion.div>

          {/* Trust micro-strip */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8125rem",
              color: "#94A3B8",
            }}
          >
            <span className="pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
            53 vehicles tracked live &nbsp;·&nbsp; 1,200+ trips completed &nbsp;·&nbsp; 99.9% accuracy
          </motion.div>
        </div>

        {/* Dashboard illustration */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          style={{ position: "relative", width: "100%", maxWidth: "900px" }}
        >
          {/* Floating stat cards */}
          {floatingCards.map((card, i) => (
            <motion.div
              key={card.id}
              id={`hero-card-${card.id}`}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.07, ease: [0.23, 1, 0.32, 1] }}
              style={{
                position: "absolute",
                ...(card.top !== undefined ? { top: card.top } : {}),
                ...(card.bottom !== undefined ? { bottom: card.bottom } : {}),
                ...(card.left !== undefined ? { left: card.left } : {}),
                ...(card.right !== undefined ? { right: card.right } : {}),
                background: "white",
                borderRadius: "14px",
                padding: "12px 16px",
                boxShadow: "0 4px 20px rgba(15,23,42,0.1), 0 1px 4px rgba(15,23,42,0.06)",
                border: "1px solid rgba(226,232,240,0.8)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                zIndex: 10,
                minWidth: "168px",
                backdropFilter: "blur(8px)",
              }}
              className="hidden-xs"
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: card.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: card.color,
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: "0.725rem", color: "#94A3B8", fontWeight: 500, marginTop: "1px" }}>
                  {card.label}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Main dashboard mockup */}
          <div
            className="animate-float"
            style={{
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 24px 80px rgba(15,23,42,0.16), 0 8px 24px rgba(15,23,42,0.08)",
              border: "1px solid rgba(226,232,240,0.7)",
              background: "#F8FAFC",
            }}
          >
            {/* Browser chrome */}
            <div
              style={{
                background: "#F1F5F9",
                borderBottom: "1px solid #E2E8F0",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                  <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div
                style={{
                  flex: 1,
                  background: "white",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  fontSize: "0.75rem",
                  color: "#94A3B8",
                  border: "1px solid #E2E8F0",
                  maxWidth: "340px",
                }}
              >
                transitops.app/dashboard
              </div>
            </div>

            {/* Dashboard screenshot */}
            <Image
              src="/dashboard-mockup.png"
              alt="TransitOps fleet management dashboard showing KPIs, vehicle status, trip tracking, and analytics"
              width={1400}
              height={840}
              priority
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hidden-xs { display: none !important; }
        }
      `}</style>
    </section>
  );
}
