import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "dark" | "bordered";
  rounded?: "xl" | "2xl" | "3xl";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", rounded = "2xl", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-white border border-slate-200/90 shadow-soft",
      elevated: "bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-shadow duration-200",
      glass: "glass-card",
      dark: "bg-slate-900 text-white border border-slate-800 shadow-soft",
      bordered: "bg-white border-2 border-slate-200 shadow-xs",
    };

    const roundedStyles = {
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
    };

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden ${roundedStyles[rounded]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

export const CardEyebrow = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", children, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-eyebrow mb-1 block ${className}`}
      {...props}
    >
      {children}
    </p>
  )
);
CardEyebrow.displayName = "CardEyebrow";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", children, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-xs text-slate-500 mt-1 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = "CardFooter";
