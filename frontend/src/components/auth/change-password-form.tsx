"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { changePassword } from "@/lib/auth-api";
import type { AuthApiError } from "@/lib/auth-api";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a digit")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch("newPassword", "");

  async function onSubmit(data: ChangePasswordFormData) {
    setLoading(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      toast.success("Password changed. Please log in again.");
    } catch (err) {
      const apiErr = err as AuthApiError;
      toast.error(apiErr?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--emerald-light)" }}>
          <Check className="h-7 w-7" style={{ color: "var(--emerald)" }} weight="bold" />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Password Updated Successfully
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Your password has been changed. Please log in again.
        </p>
        <Button onClick={() => router.push("/login")} className="mt-2">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input
        label="Current Password"
        type="password"
        placeholder="Enter your current password"
        showPasswordToggle
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />

      <PasswordInput
        label="New Password"
        value={newPassword}
        showStrength
        placeholder="Enter a new password"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />

      <div className="mt-1" />

      <Input
        label="Confirm New Password"
        type="password"
        placeholder="Re-enter your new password"
        showPasswordToggle
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" loading={loading} className="w-full">
        {loading ? "Changing password..." : "Change Password"}
      </Button>
    </form>
  );
}
