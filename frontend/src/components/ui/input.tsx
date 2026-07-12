"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, showPasswordToggle, type, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputType =
      showPasswordToggle && type === "password"
        ? visible
          ? "text"
          : "password"
        : type;

    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              "w-full rounded-lg border bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]",
              "placeholder:text-[var(--text-muted)]",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-[var(--amber)]/40 focus:border-[var(--amber)]",
              error
                ? "border-[var(--red)] focus:ring-[var(--red)]/40 focus:border-[var(--red)]"
                : "border-[var(--border)]",
              showPasswordToggle && "pr-10",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {showPasswordToggle && type === "password" && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className={cn(
                "absolute right-2.5 top-1/2 -translate-y-1/2",
                "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                "transition-colors duration-150"
              )}
              tabIndex={-1}
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-[var(--red)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input, type InputProps };
