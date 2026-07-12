"use client";

import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#040810",
        borderTop: "1px solid rgba(255,255,255,0.06)",
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
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              background: "linear-gradient(135deg, #F5A623 0%, #D4891A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="8" width="11" height="7" rx="1.5" fill="white" fillOpacity="0.95" />
              <path d="M12 10h3.5l2.5 3v2H12V10z" fill="white" fillOpacity="0.85" />
              <circle cx="5" cy="15.5" r="1.5" fill="#D4891A" />
              <circle cx="14.5" cy="15.5" r="1.5" fill="#D4891A" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "#F0F4FF",
              letterSpacing: "-0.02em",
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
