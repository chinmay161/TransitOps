"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { registerDriver, registerDispatcher, devVerifyEmail } from "@/lib/auth-api";
import type { AuthApiError } from "@/lib/auth-api";

const roles = ["driver", "dispatcher"] as const;
type Role = (typeof roles)[number];

const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Must be a valid email"),
    phone: z.string().optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a digit")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("driver");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verifying, setVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  async function handleSimulateVerify() {
    if (!registeredEmail) {
      toast.error("No registered email found.");
      return;
    }
    setVerifying(true);
    try {
      await devVerifyEmail(registeredEmail);
      toast.success("Email verified (Development Mode)");
      router.push("/login");
    } catch (err) {
      const apiErr = err as AuthApiError;
      toast.error(apiErr?.message || "Simulation failed");
    } finally {
      setVerifying(false);
    }
  }

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    try {
      const payload = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone || null,
      };
      if (role === "driver") {
        await registerDriver(payload);
      } else {
        await registerDispatcher(payload);
      }
      setRegisteredEmail(data.email);
      setSuccess(true);
      toast.success("Account created! Check your email to verify.");
    } catch (err) {
      const apiErr = err as AuthApiError;
      toast.error(apiErr?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--emerald-light)" }}>
          <UserPlus className="h-7 w-7" style={{ color: "var(--emerald)" }} weight="fill" />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Account Created Successfully
        </h3>
        <p className="text-sm max-w-xs" style={{ color: "var(--text-secondary)" }}>
          We&apos;ve sent a verification email to your inbox. Please verify your email before signing in.
        </p>

        {process.env.NODE_ENV === "development" ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs mt-2 bg-slate-50/80 border border-slate-100 rounded-2xl p-4 dark:bg-slate-900/40 dark:border-slate-800/60">
            <div className="flex flex-col items-center gap-1">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Development Mode
              </span>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Email verification is simulated locally.
              </span>
            </div>
            
            <button
              type="button"
              onClick={handleSimulateVerify}
              disabled={verifying}
              className="w-full rounded-xl py-2.5 px-4 text-xs font-semibold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              style={{
                background: "var(--amber)",
                color: "#fff",
              }}
            >
              {verifying ? "Verifying..." : "✓ Simulate Email Verified"}
            </button>

            <button
              type="button"
              className="text-xs hover:underline mt-1 cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              onClick={() => toast.info("Resend feature coming soon. Contact your fleet manager for assistance.")}
            >
              Resend Verification Email
            </button>
          </div>
        ) : (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Didn&apos;t receive it?{" "}
            <button
              type="button"
              className="hover:underline"
              style={{ color: "var(--amber)" }}
              onClick={() => toast.info("Resend feature coming soon. Contact your fleet manager for assistance.")}
            >
              Resend Verification Email
            </button>
          </p>
        )}

        <Link
          href="/login"
          className="mt-2 text-sm hover:underline"
          style={{ color: "var(--amber)" }}
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Role selector */}
      <fieldset>
        <legend className="mb-2.5 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Account Type
        </legend>
        <div className="flex gap-3">
          {roles.map((r) => (
            <label
              key={r}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium capitalize transition-all duration-150"
              style={{
                borderColor: role === r ? "var(--amber)" : "var(--border)",
                background: role === r ? "var(--amber-light)" : "var(--bg-surface)",
                color: role === r ? "var(--amber)" : "var(--text-secondary)",
              }}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                className="sr-only"
              />
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full border transition-colors duration-150"
                style={{
                  borderColor: role === r ? "var(--amber)" : "var(--border)",
                }}
              >
                {role === r && (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--amber)" }}
                  />
                )}
              </span>
              {r === "driver" ? "Driver" : "Dispatcher"}
            </label>
          ))}
        </div>
      </fieldset>

      <Input
        label="Full Name"
        placeholder="John Doe"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Phone"
        type="tel"
        placeholder="+1 (555) 000-0000"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <PasswordInput
        label="Password"
        value={password}
        showStrength
        placeholder="Create a strong password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
        showPasswordToggle
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" loading={loading} className="w-full">
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        Already have an account?{" "}
        <Link href="/login" className="hover:underline" style={{ color: "var(--amber)" }}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
