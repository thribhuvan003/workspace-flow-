import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#2dd4bf]/15 text-[#2dd4bf] border border-[#2dd4bf]/20",
        secondary: "bg-[#1e1e2e] text-white/60 border border-[#2a2a3e]",
        destructive: "bg-red-500/15 text-red-400 border border-red-500/20",
        success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        warning: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
        outline: "border border-[#2a2a3e] text-white/60",
        purple: "bg-[#2dd4bf]/15 text-purple-400 border border-[#2dd4bf]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
