import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailContent } from "./content";

export const metadata: Metadata = {
  title: "Verify Email — TransitOps",
};

export default function VerifyEmailPage() {
  return (
    <AuthCard>
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span
              className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-t-[var(--amber)]"
              style={{ borderColor: "var(--border)", borderTopColor: "var(--amber)" }}
            />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Loading...
            </p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthCard>
  );
}
