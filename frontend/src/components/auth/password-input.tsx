"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import type { InputProps } from "@/components/ui/input";

function getStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score, label: "Weak", color: "var(--red)" };
  if (score <= 4) return { score, label: "Medium", color: "var(--yellow)" };
  return { score, label: "Strong", color: "var(--emerald)" };
}

interface PasswordInputProps extends Omit<InputProps, "type" | "showPasswordToggle"> {
  value?: string;
  showStrength?: boolean;
}

export function PasswordInput({
  value = "",
  showStrength,
  ...props
}: PasswordInputProps) {
  const strength = useMemo(() => getStrength(value), [value]);

  return (
    <div className="flex flex-col gap-1">
      <Input
        type="password"
        showPasswordToggle
        {...props}
      />
      {showStrength && value.length > 0 && (
        <div className="mt-1 flex items-center gap-2">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full"
            style={{ background: "var(--bg-surface)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(strength.score / 6) * 100}%`,
                backgroundColor: strength.color,
              }}
            />
          </div>
          <span
            className="text-xs font-medium"
            style={{ color: strength.color }}
          >
            {strength.label}
          </span>
        </div>
      )}
    </div>
  );
}
