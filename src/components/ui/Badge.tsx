import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "blue" | "emerald" | "amber" | "rose" | "purple" | "slate" | "dark";
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  dotPulse?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className = "",
      variant = "blue",
      size = "sm",
      dot = false,
      dotPulse = false,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      blue: "bg-blue-50 text-blue-700 border-blue-200/80",
      emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      amber: "bg-amber-50 text-amber-800 border-amber-200/80",
      rose: "bg-rose-50 text-rose-700 border-rose-200/80",
      purple: "bg-purple-50 text-purple-700 border-purple-200/80",
      slate: "bg-slate-100 text-slate-700 border-slate-200/80",
      dark: "bg-slate-900 text-white border-slate-800",
    };

    const dotColors = {
      blue: "bg-blue-500",
      emerald: "bg-emerald-500",
      amber: "bg-amber-500",
      rose: "bg-rose-500",
      purple: "bg-purple-500",
      slate: "bg-slate-500",
      dark: "bg-emerald-400",
    };

    const sizeStyles = {
      xs: "text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md gap-1",
      sm: "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full gap-1.5",
      md: "text-xs font-bold px-3 py-1 rounded-full gap-2",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center border font-semibold select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {dot && (
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]} ${
              dotPulse ? "animate-pulse" : ""
            }`}
          />
        )}
        <span>{children}</span>
      </span>
    );
  }
);
Badge.displayName = "Badge";
