import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]"
      style={{ padding: "32px" }}
    >
      {children}
    </div>
  );
}
