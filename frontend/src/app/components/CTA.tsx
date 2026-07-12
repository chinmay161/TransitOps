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
        background: "#0F172A",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glows */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(245,166,35,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(245,166,35,0.1)",
            border: "1px solid rgba(245,166,35,0.2)",
            borderRadius: "100px",
            padding: "6px 14px",
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#F5A623",
            marginBottom: "28px",
          }}
        >
          <span className="pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F5A623", display: "inline-block" }} />
          Ready to launch
        </motion.div>

        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
          style={{
            fontSize: "clamp(2rem, 4.5vw, 3rem)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: "#F8FAFC",
            marginBottom: "20px",
            lineHeight: 1.1,
          }}
        >
          Transform Fleet Operations Today
        </motion.h2>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.23, 1, 0.32, 1] }}
          style={{
            fontSize: "1.0625rem",
            color: "#64748B",
            lineHeight: 1.65,
            marginBottom: "40px",
            maxWidth: "480px",
            margin: "0 auto 40px",
          }}
        >
          Everything your logistics team needs in one intelligent platform. Set up in minutes, scale as your fleet grows.
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.23, 1, 0.32, 1] }}
          style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}
        >
          <a href="/dashboard" id="cta-launch" className="btn-primary" style={{ padding: "14px 32px", fontSize: "1rem" }}>
            Launch App
            <ArrowRight size={18} weight="bold" />
          </a>
          <a href="#docs" id="cta-docs" className="btn-secondary" style={{ padding: "14px 32px", fontSize: "1rem", borderColor: "rgba(226,232,240,0.3)", color: "#94A3B8" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "rgba(245,166,35,0.5)";
              el.style.color = "#F5A623";
              el.style.background = "rgba(245,166,35,0.06)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "rgba(226,232,240,0.3)";
              el.style.color = "#94A3B8";
              el.style.background = "transparent";
            }}
          >
            <BookOpen size={18} />
            Documentation
          </a>
        </motion.div>

        {/* Trust signal */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.36 }}
          style={{ marginTop: "32px", fontSize: "0.8125rem", color: "#475569" }}
        >
          No credit card required &nbsp;·&nbsp; Free to start &nbsp;·&nbsp; Full feature access
        </motion.p>
      </div>
    </section>
  );
}
