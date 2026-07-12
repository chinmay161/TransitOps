"use client";

import Link from "next/link";
import { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/context/auth-context";
import { resolveDashboardRoute } from "@/utils/resolve-dashboard-route";

export function ModuleShell({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { role } = useAuth();

  const dashboardSlug = role ? resolveDashboardRoute(role).substring(1) : "login";

  // Filter tabs based on role permissions
  const allTabs = [
    { slug: dashboardSlug, label: "dashboard" },
    { slug: "expenses", label: "expenses" },
    { slug: "reports", label: "reports" },
    { slug: "notifications", label: "notifications" },
    { slug: "users", label: "user directory" },
    { slug: "admin-settings", label: "admin settings" },
  ];

  const allowedTabs = allTabs.filter((tab) => {
    if (role === "driver") {
      return [dashboardSlug, "expenses", "notifications"].includes(tab.slug);
    }
    if (role === "dispatcher") {
      return [dashboardSlug, "notifications"].includes(tab.slug);
    }
    if (role === "fleet_manager") {
      return [dashboardSlug, "expenses", "reports", "notifications", "users"].includes(tab.slug);
    }
    // admin sees all
    return true;
  });

  const uniqueAllowedTabs = allowedTabs.filter(
    (tab, index, self) => self.findIndex((t) => t.slug === tab.slug) === index
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#070D1A] px-4 pb-16 pt-24 text-[#F0F4FF] md:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <section className="rounded-[28px] border border-white/8 bg-[#0D1526] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-3">
                {uniqueAllowedTabs.map((tab) => (
                  <Link
                    key={tab.slug}
                    href={`/${tab.slug}`}
                    className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-[#C7D2E6] hover:bg-white/[0.08]"
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
              {actions}
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-[-0.04em]">{title}</h1>
          </section>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
