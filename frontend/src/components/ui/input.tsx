"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, id, ...props }, ref) => {
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
            type={type}
            className={cn(
              "w-full rounded-lg border bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]",
              "placeholder:text-[var(--text-muted)]",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-[var(--amber)]/40 focus:border-[var(--amber)]",
              error
                ? "border-[var(--red)] focus:ring-[var(--red)]/40 focus:border-[var(--red)]"
                : "border-[var(--border)]",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
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
