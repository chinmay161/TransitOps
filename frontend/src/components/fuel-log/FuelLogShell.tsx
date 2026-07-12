import Link from "next/link";
import { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const tabs = [
  { href: "/fuel-log", label: "Fuel Log List" },
  { href: "/fuel-log/new", label: "Create Fuel Log" },
];

export function FuelLogShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff7eb_0%,#f8fafc_28%,#ffffff_100%)] pt-24 text-slate-800">
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[32px] border border-amber-100 bg-white/80 p-6 shadow-[0_24px_80px_rgba(148,163,184,0.18)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                  India Fuel Operations
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-4xl">{title}</h1>
                  <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">{subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-slate-900"
                    >
                      {tab.label}
                    </Link>
                  ))}
                </div>
              </div>
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </div>
          {children}
        </section>
      </main>
      <Footer />
    </>
  );
}
