import { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#070D1A] px-4 pb-16 pt-24 text-[#F0F4FF] md:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
