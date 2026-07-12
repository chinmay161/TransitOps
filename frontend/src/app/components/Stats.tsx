"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "motion/react";

const stats = [
  { id: "vehicles", value: 53,   suffix: "+",  label: "Vehicles Managed",      color: "#F5A623" },
  { id: "trips",    value: 1200, suffix: "+",  label: "Trips Completed",        color: "#10B981" },
  { id: "util",     value: 81,   suffix: "%",  label: "Fleet Utilization",      color: "#6366F1" },
  { id: "accuracy", value: 99.9, suffix: "%",  label: "Operational Accuracy",   color: "#0EA5E9" },
];

function Counter({ value, suffix, color, run }: { value: number; suffix: string; color: string; run: boolean }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!run) return;
    const dur = 1500;
    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(parseFloat((e * value).toFixed(value % 1 === 0 ? 0 : 1)));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); startRef.current = null; };
  }, [run, value]);

  return (
    <span style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.04em", color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
      {display.toLocaleString()}{suffix}
    </span>
  );
}

export default function Stats() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="stats" style={{ padding: "96px 24px", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          style={{ textAlign: "center", marginBottom: "56px" }}
        >
          <h2 style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.375rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.15 }}>
            Numbers that move your fleet forward.
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: "360px", margin: "0 auto" }}>
            Real performance metrics from active TransitOps deployments.
          </p>
        </motion.div>

        {/* Single horizontal row — matches screenshot */}
        <div
          ref={ref}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
          className="stats-grid"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.id}
              id={`stat-${s.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.23, 1, 0.32, 1] }}
              style={{
                background: "var(--bg-card)",
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top accent bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: s.color, opacity: 0.7 }} />

              {reduceMotion ? (
                <span style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.04em", color: s.color, lineHeight: 1 }}>
                  {s.value}{s.suffix}
                </span>
              ) : (
                <Counter value={s.value} suffix={s.suffix} color={s.color} run={inView} />
              )}
              <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
