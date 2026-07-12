import type { Metadata } from "next";
<<<<<<< HEAD
import "./globals.css";
import { AuthProvider as MockAuthProvider } from "./context/AuthContext";
import { AuthProvider } from "@/context/auth-context";
=======
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
>>>>>>> 1d760bc (chore: resolve merge conflicts and finalize vehicle module)

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
>>>>>>> 1d760bc (chore: resolve merge conflicts and finalize vehicle module)
        <AuthProvider>
          <MockAuthProvider>
            {children}
          </MockAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
