"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { SignIn } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveDashboardRoute } from "@/utils/resolve-dashboard-route";
import { useAuth } from "@/context/auth-context";
import type { AuthApiError } from "@/lib/auth-api";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Must be a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    try {
      const result = await login(data);

      if (result.type === "must-change-password") {
        toast.success("Please set a new password to continue");
        router.replace("/change-password");
        return;
      }

      toast.success("Signed in successfully");
      router.replace(resolveDashboardRoute(result.user.role));
      return;
    } catch (err) {
      const apiErr = err as AuthApiError;

      if (!apiErr?.message) {
        toast.error("Unable to connect to the server. Please try again.");
        return;
      }

      toast.error(apiErr.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          showPasswordToggle
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer select-none items-center gap-2.5">
          <input
            type="checkbox"
            className="h-[18px] w-[18px] rounded accent-[var(--amber)]"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-surface)",
            }}
          />
          <span
            className="text-sm select-none"
            style={{ color: "var(--text-secondary)" }}
          >
            Remember me
          </span>
        </label>
      </div>

      <Button type="submit" loading={loading} size="lg" className="w-full">
        {loading ? "Signing in..." : "Sign In"}
        {!loading && <SignIn weight="bold" className="h-[18px] w-[18px]" />}
      </Button>

      <p
        className="text-center text-sm font-medium leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold transition-colors duration-150 hover:brightness-110"
          style={{ color: "var(--amber)" }}
        >
          Create Account
        </Link>
      </p>
    </form>
  );
}
