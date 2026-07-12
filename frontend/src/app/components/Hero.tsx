"use client";

import { motion, useReducedMotion } from "motion/react";

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      style={{
        minHeight: "auto",
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
            paddingTop: "80px",
            paddingBottom: "80px",
          }}
        >
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
        </div>
      </div>
    </section>
  );
}
