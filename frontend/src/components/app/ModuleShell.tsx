import Link from "next/link";
import { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export function ModuleShell({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#070D1A] px-4 pb-16 pt-24 text-[#F0F4FF] md:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <section className="rounded-[28px] border border-white/8 bg-[#0D1526] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-3">
                {["dashboard", "expenses", "reports", "notifications", "admin-settings"].map((slug) => (
                  <Link
                    key={slug}
                    href={`/${slug}`}
                    className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-[#C7D2E6] hover:bg-white/[0.08]"
                  >
                    {slug.replace(/-/g, " ")}
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
