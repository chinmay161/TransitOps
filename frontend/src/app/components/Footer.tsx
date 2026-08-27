"use client";

import React from "react";
import { TransitOpsLogo } from "@/components/brand/TransitOpsLogo";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-base)",
        borderTop: "2px solid var(--border)",
        padding: "60px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Logo + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <TransitOpsLogo size={20} />
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            TransitOps
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: "0.8375rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            maxWidth: "420px",
            margin: "0 auto",
          }}
        >
          TransitOps is a centralized, smart transport operations platform designed to streamline
          vehicle management, driver tracking, real-time dispatch, and analytics for modern fleet operators.
        </p>

        {/* Copyright */}
        <p
          style={{
            fontSize: "0.775rem",
            color: "var(--text-muted)",
            marginTop: "8px",
          }}
        >
          &copy; 2026 TransitOps. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
