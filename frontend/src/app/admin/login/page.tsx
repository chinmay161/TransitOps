import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AdminCredentialSignIn } from "@/components/auth/admin-credential-sign-in";
import { AuthRedirect } from "@/components/auth/auth-redirect";

export const metadata: Metadata = {
  title: "Admin Sign In — TransitOps",
};

export default function AdminLoginPage() {
  return (
    <div className="dot-grid flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <AuthRedirect />
        <div className="mb-8 text-center">
          <h1 className="text-[22px] font-bold leading-tight tracking-tight text-[var(--text-primary)]">
            Admin Sign In
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Secure access for TransitOps administrators.
          </p>
        </div>

        <AuthCard>
          <Suspense>
            <AdminCredentialSignIn />
          </Suspense>
        </AuthCard>
      </div>
    </div>
  );
}
