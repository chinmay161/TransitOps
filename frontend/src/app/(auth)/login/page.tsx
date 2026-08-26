import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleSignIn } from "@/components/auth/google-sign-in";

const EMAIL_ALREADY_EXISTS = "email_already_exists";
const ACCOUNT_NOT_FOUND = "account_not_found";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const errorParam = params.error;
  const isEmailExists = Array.isArray(errorParam)
    ? errorParam.includes(EMAIL_ALREADY_EXISTS)
    : errorParam === EMAIL_ALREADY_EXISTS;

  const isAccountNotFound = Array.isArray(errorParam)
    ? errorParam.includes("signup_disabled") || errorParam.includes("unable_to_create_user") || errorParam.includes(ACCOUNT_NOT_FOUND)
    : errorParam === "signup_disabled" || errorParam === "unable_to_create_user" || errorParam === ACCOUNT_NOT_FOUND;

  return {
    title: isEmailExists
      ? "Account Already Exists — TransitOps"
      : isAccountNotFound
      ? "Account Not Found — TransitOps"
      : "Sign In — TransitOps",
  };
}

// Dedicated terminal failure page for the server-side signup gate:
// Sign Up attempted with a Google email that already belongs to a
// TransitOps account. Rendered INSTEAD of the normal login UI - the
// regular login card and OAuth button never enter the DOM for this error.

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const errorParam = params.error;
  const isEmailExists = Array.isArray(errorParam)
    ? errorParam.includes(EMAIL_ALREADY_EXISTS)
    : errorParam === EMAIL_ALREADY_EXISTS;

  if (isEmailExists) {
    return (
      <AuthCard>
        <div className="text-center">
          <div
            className="rounded-lg border px-5 py-6"
            role="alert"
            style={{
              borderColor: "rgba(239, 68, 68, 0.45)",
              background: "rgba(239, 68, 68, 0.08)",
            }}
          >
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Account Already Exists
            </h1>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              This email ID is already linked with an existing TransitOps
              account. Kindly try logging in.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={{
                padding: "10px 20px",
                color: "#050A14",
                background:
                  "linear-gradient(135deg, #F5A623 0%, #D4891A 100%)",
                boxShadow: "0 2px 10px rgba(245, 166, 35, 0.25)",
              }}
            >
              Go to Home
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  const isAccountNotFound = Array.isArray(errorParam)
    ? errorParam.includes("signup_disabled") || errorParam.includes("unable_to_create_user") || errorParam.includes(ACCOUNT_NOT_FOUND)
    : errorParam === "signup_disabled" || errorParam === "unable_to_create_user" || errorParam === ACCOUNT_NOT_FOUND;

  if (isAccountNotFound) {
    return (
      <AuthCard>
        <div className="text-center">
          <div
            className="rounded-lg border px-5 py-6"
            role="alert"
            style={{
              borderColor: "rgba(245, 166, 35, 0.45)",
              background: "rgba(245, 166, 35, 0.08)",
            }}
          >
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Account Not Found
            </h1>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              This email ID is not linked with a TransitOps account. Please sign up first.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={{
                padding: "10px 20px",
                color: "#050A14",
                background:
                  "linear-gradient(135deg, #F5A623 0%, #D4891A 100%)",
                boxShadow: "0 2px 10px rgba(245, 166, 35, 0.25)",
              }}
            >
              Go to Home
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

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
        <Suspense>
          <GoogleSignIn />
        </Suspense>
      </AuthCard>
    </>
  );
}
