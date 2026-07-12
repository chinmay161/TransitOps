"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ArrowRight, Play, Truck, Users, Package, ChartLine } from "@phosphor-icons/react";

const kpis = [
  { id: "kpi-vehicles", value: "53", label: "Active Vehicles", delta: "+5.2%", color: "#F5A623", icon: <Truck size={16} weight="fill" /> },
  { id: "kpi-drivers",  value: "26", label: "Drivers On Duty",  delta: "-1.8%", color: "#10B981", icon: <Users size={16} weight="fill" /> },
  { id: "kpi-trips",   value: "18", label: "Active Trips",     delta: "+12%",  color: "#6366F1", icon: <Package size={16} weight="fill" /> },
  { id: "kpi-util",    value: "81%",label: "Utilization",      delta: "+3.5%", color: "#0EA5E9", icon: <ChartLine size={16} weight="fill" /> },
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
        paddingTop: "60px",
        background: "var(--bg-base)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dot grid background */}
      <div
        className="dot-grid"
        style={{ position: "absolute", inset: 0, opacity: 0.6, pointerEvents: "none" }}
      />

      {/* Ambient glows */}
      <div className="glow-amber" style={{ width: "800px", height: "800px", top: "-200px", left: "50%", transform: "translateX(-50%)", opacity: 0.6 }} />
      <div className="glow-emerald" style={{ width: "400px", height: "400px", bottom: "10%", right: "-100px" }} />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
          zIndex: 1,
          paddingTop: "56px",
        }}
      >
        {/* ── Dashboard mockup block ─────────────────────────────── */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          style={{ width: "100%", position: "relative" }}
        >
          {/* Browser chrome */}
          <div
            style={{
              background: "#0D1526",
              borderRadius: "16px 16px 0 0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
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
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "6px",
                padding: "4px 12px",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                maxWidth: "320px",
              }}
            >
              transitops.app/dashboard
            </div>
          </div>

          {/* Dashboard image */}
          <div
            style={{
              position: "relative",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "none",
              borderRadius: "0 0 0 0",
              overflow: "hidden",
            }}
          >
            <Image
              src="/dashboard-mockup.png"
              alt="TransitOps fleet dashboard with live map, vehicle status, and KPI analytics"
              width={1400}
              height={820}
              priority
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            {/* Bottom fade */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "40%",
                background: "linear-gradient(to bottom, transparent, var(--bg-base))",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* KPI strip — overlapping the dashboard */}
          <div
            style={{
              position: "relative",
              marginTop: "-2px",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            className="kpi-strip"
          >
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.id}
                id={kpi.id}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.4 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  background: "rgba(13,21,38,0.95)",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: `${kpi.color}18`,
                    border: `1px solid ${kpi.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: kpi.color,
                    flexShrink: 0,
                  }}
                >
                  {kpi.icon}
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F0F4FF", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "3px" }}>{kpi.label}</div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: kpi.delta.startsWith("+") ? "#10B981" : "#EF4444",
                    background: kpi.delta.startsWith("+") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                    padding: "3px 7px",
                    borderRadius: "5px",
                  }}
                >
                  {kpi.delta}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Headline + CTAs ───────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "24px",
            maxWidth: "760px",
            paddingTop: "60px",
            paddingBottom: "80px",
          }}
        >
          {/* Live badge */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.7, ease: [0.23, 1, 0.32, 1] }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              background: "rgba(245,166,35,0.08)",
              border: "1px solid rgba(245,166,35,0.2)",
              borderRadius: "100px",
              padding: "5px 14px 5px 8px",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: "#D4891A",
            }}
          >
            <span className="pulse-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#F5A623", display: "inline-block" }} />
            Live fleet tracking — 53 vehicles active now
          </motion.div>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.78, ease: [0.23, 1, 0.32, 1] }}
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              color: "#F0F4FF",
            }}
          >
            Smart Transport Operations,{" "}
            <span className="text-gradient-amber">Built for Modern</span>{" "}
            Fleet Management.
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.86, ease: [0.23, 1, 0.32, 1] }}
            style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: "520px" }}
          >
            Digitize your fleet with a centralized platform for vehicle management,
            driver tracking, dispatch, maintenance, fuel monitoring, and analytics.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.94, ease: [0.23, 1, 0.32, 1] }}
            style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}
          >
            <a href="/dashboard" id="hero-launch-cta" className="btn-primary" style={{ padding: "13px 28px", fontSize: "0.9375rem" }}>
              Launch Dashboard <ArrowRight size={17} weight="bold" />
            </a>
            <a href="#demo" id="hero-demo-cta" className="btn-ghost" style={{ padding: "13px 28px", fontSize: "0.9375rem" }}>
              <Play size={15} weight="fill" /> View Demo
            </a>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .kpi-strip { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
