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
<<<<<<< HEAD
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} style={{ colorScheme: "dark" }}>
      <body style={{ fontFamily: "var(--font-geist), 'Inter', system-ui, sans-serif", background: "#070D1A" }}>
        {children}
      </body>
=======
    <html lang="en">
      <body>{children}</body>
>>>>>>> 8b9ef1e (feat(fuel-log): add complete fuel log module with CRUD, fuel price fallback, frontend and backend)
    </html>
  );
}
