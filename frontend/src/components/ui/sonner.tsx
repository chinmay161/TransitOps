"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          borderRadius: "12px",
          fontFamily: "var(--font-geist), 'Inter', system-ui, sans-serif",
        },
      }}
      closeButton
    />
  );
}
