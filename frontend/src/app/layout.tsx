import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" style={{ colorScheme: "dark" }}>
      <body
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          background: "#070D1A",
        }}
      >
        {children}
      </body>
    </html>
  );
}
