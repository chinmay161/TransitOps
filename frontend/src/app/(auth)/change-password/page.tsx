import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Change Password — TransitOps",
};

export default function ChangePasswordPage() {
  return (
    <AuthCard>
      <ChangePasswordForm />
    </AuthCard>
  );
}
