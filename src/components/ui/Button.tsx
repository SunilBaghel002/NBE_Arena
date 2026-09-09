import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger" | "success" | "dark";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-exam-primary hover:bg-exam-primaryHover text-white shadow-sm hover:shadow active:scale-[0.98] border border-transparent",
      accent:
        "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-[0.98] border border-transparent",
      secondary:
        "bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-[0.98] border border-slate-200/80",
      outline:
        "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 active:scale-[0.98]",
      ghost:
        "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow active:scale-[0.98] border border-transparent",
      success:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:scale-[0.98] border border-transparent",
      dark:
        "bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow active:scale-[0.98] border border-slate-800",
    };

    const sizeStyles = {
      xs: "text-[11px] font-bold px-2.5 py-1.5 rounded-lg gap-1.5",
      sm: "text-xs font-bold px-3.5 py-2 rounded-xl gap-1.5",
      md: "text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl gap-2",
      lg: "text-sm sm:text-base font-extrabold px-6 py-3.5 rounded-2xl gap-2.5",
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center transition-all duration-150 focus-ring select-none ${
          variantStyles[variant]
        } ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${
          isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        } ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
