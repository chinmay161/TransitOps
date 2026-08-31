"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeSlash } from "@phosphor-icons/react";

function getAuthBaseURL(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}

function mapErrorToMessage(
  resStatus: number,
  body: Record<string, unknown> | undefined
): string {
  const errorObj = body?.error as
    | { message?: string; code?: string }
    | undefined;
  const code = errorObj?.code;

  if (code === "admin_auth_required" || resStatus === 403) {
    return "You are not authorized to access the admin panel.";
  }
  if (code === "credential_restricted") {
    return "Credential login is restricted to admin accounts.";
  }

  return "Invalid email or password. Please try again.";
}

export function AdminCredentialSignIn() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const errorParam = searchParams.get("error");
  const isAdminAuthRequired = errorParam === "admin_auth_required";
  const isCredentialRestricted = errorParam === "credential_restricted";
  const isInvalidCredentials =
    errorParam === "INVALID_EMAIL_OR_PASSWORD" ||
    errorParam === "credential_sign_in_failed";

  useEffect(() => {
    setInlineError(null);
  }, [email, password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setInlineError(null);
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
        setInlineError(mapErrorToMessage(res.status, body));
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch {
      setInlineError(
        "Unable to sign in right now. Please try again."
      );
      setLoading(false);
    }
  }

  const alertStyle = {
    borderColor: "rgba(239, 68, 68, 0.45)",
    background: "rgba(239, 68, 68, 0.08)",
    color: "var(--text-primary)",
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isAdminAuthRequired && (
        <div className="rounded-lg border px-4 py-3 text-sm leading-relaxed" role="alert" style={alertStyle}>
          Your session was created via Google OAuth. Admin accounts must use this admin login page.
        </div>
      )}

      {isCredentialRestricted && (
        <div className="rounded-lg border px-4 py-3 text-sm leading-relaxed" role="alert" style={alertStyle}>
          Credential login is restricted to admin accounts. Please use Google sign-in.
        </div>
      )}

      {isInvalidCredentials && (
        <div className="rounded-lg border px-4 py-3 text-sm leading-relaxed" role="alert" style={alertStyle}>
          Invalid email or password. Admin credentials only.
        </div>
      )}

      {inlineError && (
        <div className="rounded-lg border px-4 py-3 text-sm leading-relaxed" role="alert" style={alertStyle}>
          {inlineError}
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

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-password"
          className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wide"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-[var(--radius-md)] border-2 border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2.5 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors duration-150 focus:outline-none focus:ring-3 focus:ring-[var(--amber)]/30 focus:border-[var(--amber)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
          </button>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Sign In as Admin
      </Button>
    </form>
  );
}
