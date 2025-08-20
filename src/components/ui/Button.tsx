import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", className = "", children, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-gradient-to-br from-cyan-400/30 to-sky-500/30 hover:from-cyan-400/40 hover:to-sky-500/40 border border-white/10 backdrop-blur-xl text-slate-100",
      secondary:
        "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-slate-100",
      ghost:
        "hover:bg-white/7 border border-transparent hover:border-white/10 text-slate-300/90 hover:text-slate-100",
    };

    const sizes = {
      sm: "px-2.5 py-1.5 text-xs",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
