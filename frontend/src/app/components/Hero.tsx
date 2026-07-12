"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Play } from "@phosphor-icons/react";

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
            <a href="/drivers" id="hero-launch-cta" className="btn-primary" style={{ padding: "13px 28px", fontSize: "0.9375rem" }}>
              Launch App <ArrowRight size={17} weight="bold" />
            </a>
            <a href="#demo" id="hero-demo-cta" className="btn-ghost" style={{ padding: "13px 28px", fontSize: "0.9375rem" }}>
              <Play size={15} weight="fill" /> View Demo
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
