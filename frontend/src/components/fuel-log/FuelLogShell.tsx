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
      <main className="dot-grid min-h-screen bg-[#070D1A] pt-24 text-[#F0F4FF]">
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[32px] border border-white/8 bg-[#0D1526] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#F5A623]">
                  Fuel Operations
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-[-0.04em] text-[#F0F4FF] sm:text-4xl">{title}</h1>
                  <p className="mt-2 max-w-3xl text-sm text-[#6B7FA3] sm:text-base">{subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm font-medium text-[#C7D2E6] transition hover:border-[#F5A623]/30 hover:bg-[#F5A623]/10 hover:text-[#F0F4FF]"
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
