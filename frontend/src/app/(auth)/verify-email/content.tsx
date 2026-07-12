"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, WarningCircle, X, ArrowRight, Envelope } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/auth-api";
import type { AuthApiError } from "@/lib/auth-api";

type VerifyState =
  | { status: "loading" }
  | { status: "no-token" }
  | { status: "success" }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "error"; message: string };

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>({ status: "loading" });

  const handleVerify = useCallback(async () => {
    if (!token) {
      setState({ status: "no-token" });
      return;
    }

    setState({ status: "loading" });
    try {
      await verifyEmail(token);
      setState({ status: "success" });
    } catch (err) {
      const apiErr = err as AuthApiError;
      if (apiErr?.status === 400) {
        setState({ status: "expired" });
      } else {
        setState({
          status: "error",
          message: apiErr?.message || "Verification failed",
        });
      }
    }
  }, [token]);

  useEffect(() => {
    handleVerify();
  }, [handleVerify]);

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <StatusIcon state={state} />
      <StatusContent state={state} onRetry={handleVerify} router={router} />
    </div>
  );
}

function StatusIcon({ state }: { state: VerifyState }) {
  switch (state.status) {
    case "loading":
      return (
        <span
          className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-t-[var(--amber)]"
          style={{ borderColor: "var(--border)", borderTopColor: "var(--amber)" }}
        />
      );
    case "no-token":
      return (
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--amber-light)" }}>
          <Envelope className="h-7 w-7" style={{ color: "var(--amber)" }} weight="fill" />
        </div>
      );
    case "success":
      return (
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--emerald-light)" }}>
          <Check className="h-7 w-7" style={{ color: "var(--emerald)" }} weight="bold" />
        </div>
      );
    case "invalid":
    case "expired":
      return (
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--amber-light)" }}>
          <WarningCircle className="h-7 w-7" style={{ color: "var(--amber)" }} weight="fill" />
        </div>
      );
    case "error":
      return (
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "rgba(239,68,68,0.1)" }}>
          <X className="h-7 w-7" style={{ color: "var(--red)" }} weight="bold" />
        </div>
      );
  }
}

function StatusContent({
  state,
  onRetry,
  router,
}: {
  state: VerifyState;
  onRetry: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  switch (state.status) {
    case "loading":
      return (
        <>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Verifying your email...
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Please wait while we confirm your email address.
          </p>
        </>
      );
    case "no-token":
      return (
        <>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Verify your email
          </h3>
          <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
            Please check your inbox for the verification email we sent you. Click the link in the email to activate your account.
          </p>
          <Button variant="ghost" onClick={() => router.push("/login")} className="mt-4">
            Go to Login
            <ArrowRight weight="bold" className="h-4 w-4" />
          </Button>
        </>
      );
    case "success":
      return (
        <>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Email Verified
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            You can now sign in.
          </p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Go to Login
            <ArrowRight weight="bold" className="h-4 w-4" />
          </Button>
        </>
      );
    case "invalid":
      return (
        <>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Invalid Link
          </h3>
          <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
            This verification link is invalid. Please check that you used the correct link from your email.
          </p>
          <Button variant="ghost" onClick={() => router.push("/login")} className="mt-4">
            Go to Login
            <ArrowRight weight="bold" className="h-4 w-4" />
          </Button>
        </>
      );
    case "expired":
      return (
        <>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Verification link expired.
          </h3>
          <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
            Verification links are valid for 24 hours. Request a new one below.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Resend Verification Email
            </Button>
            <Button variant="ghost" onClick={() => router.push("/login")}>
              Go to Login
              <ArrowRight weight="bold" className="h-4 w-4" />
            </Button>
          </div>
        </>
      );
    case "error":
      return (
        <>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Verification failed
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {state.message}
          </p>
          <Button variant="ghost" onClick={onRetry} className="mt-4">
            Try again
          </Button>
        </>
      );
  }
}
