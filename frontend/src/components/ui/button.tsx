"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[var(--amber)] text-[#0B0F1A] font-bold border-2 border-[#0B0F1A] shadow-[var(--shadow-card)] hover:bg-[var(--amber-dark)] hover:shadow-[var(--shadow-elevated)] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  ghost:
    "bg-[var(--bg-surface)] text-[var(--text-primary)] border-2 border-[var(--border)] hover:bg-[var(--bg-card)] hover:border-[var(--border-strong)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.4)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
  danger:
    "bg-[var(--red)] text-white font-bold border-2 border-[#0B0F1A] shadow-[var(--shadow-card)] hover:brightness-110 hover:shadow-[var(--shadow-elevated)] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  outline:
    "border-2 border-[var(--border)] text-[var(--text-primary)] bg-transparent hover:bg-[var(--bg-surface)] hover:border-[var(--border-strong)] active:translate-x-[1px] active:translate-y-[1px]",
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
          "inline-flex items-center justify-center gap-2 cursor-pointer rounded-[var(--radius-md)]",
          "transition-all duration-100 ease-linear",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
          "select-none",
          "focus-visible:outline-3 focus-visible:outline-[var(--amber)] focus-visible:outline-offset-2",
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
