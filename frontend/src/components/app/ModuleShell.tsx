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

  const allTabs = [
    { slug: dashboardSlug, label: "Dashboard" },
    { slug: "expenses", label: "Expenses" },
    { slug: "reports", label: "Reports" },
    { slug: "notifications", label: "Notifications" },
    { slug: "dashboard/users", label: "User Management" },
    { slug: "admin-settings", label: "Admin Settings" },
  ];

  const allowedTabs = allTabs.filter((tab) => {
    if (role === "driver") {
      return [dashboardSlug, "expenses", "notifications"].includes(tab.slug);
    }
    if (role === "dispatcher") {
      return [dashboardSlug, "notifications"].includes(tab.slug);
    }
    if (role === "fleet_manager") {
      return [dashboardSlug, "expenses", "reports", "notifications", "dashboard/users"].includes(tab.slug);
    }
    return true;
  });

  const uniqueAllowedTabs = allowedTabs.filter(
    (tab, index, self) => self.findIndex((t) => t.slug === tab.slug) === index
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg-base)] px-4 pb-16 pt-24 text-[var(--text-primary)] md:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <section className="rounded-[var(--radius-xl)] border-2 border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {uniqueAllowedTabs.map((tab) => (
                  <Link
                    key={tab.slug}
                    href={`/${tab.slug}`}
                    className="rounded-[var(--radius-md)] border-2 border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-100 hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.4)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
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
