import type { Metadata } from "next";
<<<<<<< HEAD
=======
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
>>>>>>> 880f3f6 (feat(auth): implement authentication module and login flow)
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "TransitOps — Smart Transport Operations Platform",
  description:
    "Digitize your fleet operations with a centralized platform for vehicle management, driver tracking, dispatch, maintenance, fuel monitoring, and operational analytics.",
  keywords: ["fleet management", "transport operations", "vehicle tracking", "dispatch", "logistics software"],
  openGraph: {
    title: "TransitOps — Smart Transport Operations Platform",
    description:
      "Centralized fleet management: vehicles, drivers, trips, maintenance, fuel & analytics in one intelligent platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
<<<<<<< HEAD
    <html lang="en" style={{ colorScheme: "dark" }}>
      <body
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          background: "#070D1A",
        }}
      >
=======
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} style={{ colorScheme: "dark" }}>
      <body style={{ fontFamily: "var(--font-geist), 'Inter', system-ui, sans-serif", background: "#070D1A" }}>
>>>>>>> 880f3f6 (feat(auth): implement authentication module and login flow)
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
