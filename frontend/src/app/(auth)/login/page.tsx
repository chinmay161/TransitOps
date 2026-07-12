import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Sign In — TransitOps",
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1
          className="text-[22px] font-bold leading-tight tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Sign in to TransitOps
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Manage your fleet, drivers, dispatchers and operations from one place.
        </p>
      </div>

      <AuthCard>
        <LoginForm />
      </AuthCard>
    </>
  );
}
