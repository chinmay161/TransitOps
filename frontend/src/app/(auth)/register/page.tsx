import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Create Account — TransitOps",
};

export default function RegisterPage() {
  return (
    <AuthCard>
      <RegisterForm />
    </AuthCard>
  );
}
