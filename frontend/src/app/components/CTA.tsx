"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, BookOpen } from "@phosphor-icons/react";

export default function CTA() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="cta"
      style={{
        padding: "96px 24px",
        background: "var(--bg-base)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Strong ambient amber glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "900px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(245,166,35,0.14) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Dot grid */}
      <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none" }} />

      {/* Faint border lines */}
      <div
        style={{
          position: "absolute",
          inset: "32px",
          border: "1px solid rgba(245,166,35,0.06)",
          borderRadius: "24px",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            background: "rgba(245,166,35,0.08)",
            border: "1px solid rgba(245,166,35,0.18)",
            borderRadius: "100px",
            padding: "5px 14px 5px 8px",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#D4891A",
            marginBottom: "28px",
          }}
        >
          <span className="pulse-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#F5A623", display: "inline-block" }} />
          Ready to launch
        </motion.div>

        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
          style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.035em", color: "var(--text-primary)", marginBottom: "18px", lineHeight: 1.1 }}
        >
          Transform Fleet Operations Today
        </motion.h2>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.23, 1, 0.32, 1] }}
          style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "440px", margin: "0 auto 36px" }}
        >
          Everything your logistics team needs in one intelligent platform.
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, delay: 0.24, ease: [0.23, 1, 0.32, 1] }}
          style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}
        >
          <a href="/dashboard" id="cta-launch" className="btn-primary" style={{ padding: "14px 32px", fontSize: "0.9375rem" }}>
            Launch App <ArrowRight size={17} weight="bold" />
          </a>
          <a href="#docs" id="cta-docs" className="btn-ghost" style={{ padding: "14px 32px", fontSize: "0.9375rem" }}>
            <BookOpen size={17} /> Documentation
          </a>
        </motion.div>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.36 }}
          style={{ marginTop: "28px", fontSize: "0.8rem", color: "var(--text-muted)" }}
        >
          No credit card required &nbsp;·&nbsp; Free to start &nbsp;·&nbsp; Full feature access
        </motion.p>
      </div>
    </section>
  );
}
