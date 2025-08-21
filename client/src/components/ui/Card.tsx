import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.45)] ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
