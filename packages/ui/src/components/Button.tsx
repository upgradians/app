import React from "react";
import { cn } from "../utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ButtonSize    = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  as?: "button" | "a";
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:  "bg-gradient-to-r from-brand to-brand-dark text-white shadow-brand/30 shadow-md hover:shadow-brand/50 hover:shadow-lg active:scale-[0.98]",
  secondary:"bg-surface-2 text-text-1 border border-border hover:border-brand/40 hover:text-brand active:scale-[0.98]",
  ghost:    "bg-transparent text-text-2 hover:bg-surface-2 hover:text-text-1 active:scale-[0.98]",
  outline:  "bg-transparent text-brand border border-brand/60 hover:bg-brand hover:text-white active:scale-[0.98]",
  danger:   "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-3 py-1.5 text-xs gap-1.5",
  sm: "px-4 py-2   text-sm gap-2",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, leftIcon, rightIcon, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer select-none whitespace-nowrap",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
