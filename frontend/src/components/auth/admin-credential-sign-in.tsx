"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Resolve the Better Auth base URL. In the browser we use the current origin
 * (where /api/auth is proxied to the backend via Next.js rewrites).
 */
function getAuthBaseURL(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}

export function AdminCredentialSignIn() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const errorParam = searchParams.get("error");
  const isAdminAuthRequired = errorParam === "admin_auth_required";
  const isCredentialRestricted = errorParam === "credential_restricted";
  const isInvalidCredentials =
    errorParam === "INVALID_EMAIL_OR_PASSWORD" ||
    errorParam === "credential_sign_in_failed";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      const base = getAuthBaseURL();
      const res = await fetch(`${base}/api/auth/sign-in/email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || body?.error) {
        const msg =
          body?.error?.message ||
          body?.message ||
          "Invalid email or password. Please try again.";
        toast.error(msg);
        setLoading(false);
        return;
      }

      // On success, reload so AuthRedirect and the proxy middleware
      // route the admin to /admin-settings based on role.
      window.location.reload();
    } catch {
      toast.error("Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdminAuthRequired && (
        <div
          className="rounded-lg border px-4 py-3 text-sm leading-relaxed"
          role="alert"
          style={{
            borderColor: "rgba(239, 68, 68, 0.45)",
            background: "rgba(239, 68, 68, 0.08)",
            color: "var(--text-primary)",
          }}
        >
          Your session was created via Google OAuth. Admin accounts must use
          this admin login page.
        </div>
      )}

      {isCredentialRestricted && (
        <div
          className="rounded-lg border px-4 py-3 text-sm leading-relaxed"
          role="alert"
          style={{
            borderColor: "rgba(239, 68, 68, 0.45)",
            background: "rgba(239, 68, 68, 0.08)",
            color: "var(--text-primary)",
          }}
        >
          Credential login is restricted to admin accounts. Please use Google
          sign-in.
        </div>
      )}

      {isInvalidCredentials && (
        <div
          className="rounded-lg border px-4 py-3 text-sm leading-relaxed"
          role="alert"
          style={{
            borderColor: "rgba(239, 68, 68, 0.45)",
            background: "rgba(239, 68, 68, 0.08)",
            color: "var(--text-primary)",
          }}
        >
          Invalid email or password. Admin credentials only.
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="admin@ves.ac.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Sign In as Admin
      </Button>
    </form>
  );
}
