"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[var(--amber)] text-[#0D0D0D] font-semibold shadow-[0_1px_4px_rgba(245,166,35,0.28)] hover:bg-[var(--amber-dark)] hover:shadow-[var(--shadow-amber)] hover:-translate-y-[1px] active:scale-[0.97] active:shadow-none",
  ghost:
    "bg-[rgba(255,255,255,0.06)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.14)] hover:-translate-y-[1px] active:scale-[0.97]",
  outline:
    "border border-[var(--border)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.97]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg cursor-pointer",
          "transition-all duration-150 ease-[var(--ease-out)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          "select-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button, type ButtonProps };
