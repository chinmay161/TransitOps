import { ReactNode } from "react";
import { ToastProvider } from "@/components/fuel-log/ToastProvider";

export default function FuelLogLayout({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
