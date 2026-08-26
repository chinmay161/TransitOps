import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { PendingAccessContent } from "./content";

export const metadata: Metadata = {
  title: "Access Pending — TransitOps",
};

export default function PendingAccessPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1
          className="text-[22px] font-bold leading-tight tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Account awaiting access
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Your Google account is verified, but no TransitOps role has been
          assigned yet.
        </p>
      </div>

      <AuthCard>
        <PendingAccessContent />
      </AuthCard>
    </>
  );
}
