"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function PendingAccessContent() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await authClient.signOut({ fetchOptions: { credentials: "include" } });
    } catch {
      // ignore network failures during sign-out
    }
    router.replace("/login");
  }

  return (
    <div className="flex flex-col gap-5">
      <p
        className="text-center text-sm leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        An administrator needs to assign you a role (for example driver,
        dispatcher, fleet manager or admin) before you can use TransitOps.
        Please contact your administrator, or sign out and check back later.
      </p>

      <Button onClick={handleSignOut} size="lg" className="w-full">
        Sign Out
      </Button>
    </div>
  );
}
