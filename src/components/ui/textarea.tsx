import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-[#2a2a3e] bg-[#111118] px-3 py-2",
            "text-sm text-white placeholder:text-white/30",
            "focus:outline-none focus:ring-2 focus:ring-[#2dd4bf]/50 focus:border-[#2dd4bf]/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200 resize-none",
            error && "border-red-500/50 focus:ring-red-500/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
