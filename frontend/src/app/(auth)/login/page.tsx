import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { AuthRedirect } from "@/components/auth/auth-redirect";

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

  const isAccountNotFound = Array.isArray(errorParam)
    ? errorParam.includes("signup_disabled") || errorParam.includes("unable_to_create_user") || errorParam.includes(ACCOUNT_NOT_FOUND)
    : errorParam === "signup_disabled" || errorParam === "unable_to_create_user" || errorParam === ACCOUNT_NOT_FOUND;

  return (
    <>
      <AuthRedirect />
      {isEmailExists ? (
        <AuthCard>
          <div className="text-center">
            <div
              className="rounded-[var(--radius-md)] border-2 border-[var(--red)]/40 bg-[var(--red-light)] px-5 py-6"
              role="alert"
            >
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Account Already Exists
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                This email ID is already linked with an existing TransitOps
                account. Kindly try logging in.
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="btn-primary w-full text-sm"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </AuthCard>
      ) : isAccountNotFound ? (
        <AuthCard>
          <div className="text-center">
            <div
              className="rounded-[var(--radius-md)] border-2 border-[var(--amber)]/40 bg-[var(--amber-light)] px-5 py-6"
              role="alert"
            >
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Account Not Found
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                This email ID is not linked with a TransitOps account. Please sign up first.
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="btn-primary w-full text-sm"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </AuthCard>
      ) : (
        <>
          <div className="mb-8 text-center">
            <h1 className="text-[22px] font-bold leading-tight tracking-tight text-[var(--text-primary)]">
              Sign in to TransitOps
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Manage your fleet, drivers, dispatchers and operations from one place.
            </p>
          </div>

          <AuthCard>
            <Suspense>
              <GoogleSignIn />
            </Suspense>
          </AuthCard>
        </>
      )}
    </>
  );
}