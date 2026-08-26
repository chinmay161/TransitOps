"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--bg-card)",
          border: "2px solid var(--border)",
          color: "var(--text-primary)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
          fontFamily: "var(--font-geist), 'Inter', system-ui, sans-serif",
        },
      }}
      closeButton
    />
  );
}
