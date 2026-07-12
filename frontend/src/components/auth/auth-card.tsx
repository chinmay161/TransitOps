import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-2xl border"
      style={{
        padding: "32px",
        background: "var(--bg-card)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {children}
    </div>
  );
}
