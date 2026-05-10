"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5c00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#cc3d00] text-white hover:bg-[#ff5c00] shadow-lg shadow-[#ff5c00]/20 active:scale-[0.98]",
        destructive:
          "bg-red-600/90 text-white hover:bg-red-500 shadow-lg shadow-red-500/20",
        outline:
          "border border-[#2a2a3e] bg-transparent text-white/80 hover:bg-[#1a1a26] hover:text-white hover:border-[#3a3a52]",
        secondary:
          "bg-[#1e1e2e] text-white/80 hover:bg-[#2a2a3e] hover:text-white",
        ghost:
          "text-white/60 hover:bg-[#1a1a26] hover:text-white",
        link:
          "text-[#ff5c00] underline-offset-4 hover:underline hover:text-[#ff8a40] p-0 h-auto",
        gradient:
          "bg-gradient-to-r from-[#cc3d00] to-[#cc3d00] text-white hover:from-[#ff5c00] hover:to-[#ff5c00] shadow-lg shadow-[#ff5c00]/25 active:scale-[0.98]",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        xl: "h-13 rounded-xl px-8 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7 rounded-md text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
