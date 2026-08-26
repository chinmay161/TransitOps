"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

// Server-side signup/login enforcement codes (see backend better-auth.ts):
// - email_already_exists : Sign Up used with an email that already belongs to
//   a TransitOps account. Terminal state: log in instead.
// - signup_disabled / unable_to_create_user :
//   Log In used with a Google email that has no TransitOps account. Offer Sign Up.
const EMAIL_EXISTS_CODES = new Set([
  "email_already_exists",
  "unable_to_link_account",
  "email_exists",
]);

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function GoogleSignIn() {
  const { signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const errorParams = searchParams.getAll("error");
  const isEmailExistsError = errorParams.some(e => EMAIL_EXISTS_CODES.has(e));

  useEffect(() => {
    if (errorParams.length > 0 && !isEmailExistsError) {
      toast.error(
        "Google sign-in failed or was cancelled. Please try again."
      );
    }
  }, [errorParams.length, isEmailExistsError]);

  async function handleGoogleFlow(intent: "login" | "signup") {
    setLoading(true);
    try {
      await signInWithGoogle(intent);
      // On success Better Auth redirects the browser; keep showing the
      // loading state until navigation happens.
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to start Google sign-in. Please try again."
      );
      setLoading(false);
    }
  }

  // TERMINAL STATE A: Sign Up attempted with an email that already belongs to
  // a TransitOps account. No OAuth retry, no dashboard access.
  if (isEmailExistsError) {
    return (
      <div className="flex flex-col gap-5">
        <div
          className="rounded-lg border px-4 py-4 text-sm leading-relaxed"
          role="alert"
          style={{
            borderColor: "rgba(239, 68, 68, 0.45)",
            background: "rgba(239, 68, 68, 0.08)",
            color: "var(--text-primary)",
          }}
        >
          This email ID is already linked with an existing TransitOps account.
          Kindly try logging in.
        </div>

        <Button
          onClick={() => void handleGoogleFlow("login")}
          loading={loading}
          size="lg"
          className="w-full"
        >
          {loading ? "Redirecting to Google..." : "Log In"}
          {!loading && <GoogleIcon />}
        </Button>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-5">
      <Button
        type="button"
        onClick={() => void handleGoogleFlow("login")}
        loading={loading}
        size="lg"
        className="w-full"
      >
        {loading ? "Redirecting to Google..." : "Continue with Google"}
        {!loading && <GoogleIcon />}
      </Button>

      <button
        type="button"
        onClick={() => void handleGoogleFlow("signup")}
        disabled={loading}
        className="text-center text-xs font-semibold transition-colors duration-150 hover:brightness-110 disabled:opacity-60"
        style={{ color: "var(--amber)", cursor: "pointer" }}
      >
        New here? Create an account with Google instead
      </button>

      <p
        className="text-center text-xs leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        Use your work Google account. New users are created automatically and
        await role assignment by an administrator.
      </p>
    </div>
  );
}
