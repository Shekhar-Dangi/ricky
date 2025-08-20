import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "ghost";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = "default", className = "", ...props }, ref) => {
    const variants = {
      default: "bg-white/5 border border-white/10 rounded-2xl px-3 py-2",
      ghost: "bg-transparent border-none",
    };

    return (
      <input
        ref={ref}
        className={`w-full outline-none text-slate-100 placeholder:text-slate-400 text-sm tracking-tight ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
