"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  pushToast: (message: string, tone: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const value = useMemo(
    () => ({
      pushToast(message: string, tone: ToastTone) {
        const id = Date.now() + Math.random();
        setItems((current) => [...current, { id, message, tone }]);
        window.setTimeout(() => {
          setItems((current) => current.filter((item) => item.id !== id));
        }, 3200);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              item.tone === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
                : "border-rose-200 bg-rose-50/95 text-rose-900"
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return context;
}
