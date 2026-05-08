import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent text-indigo-500",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "md",
          "h-10 w-10": size === "lg",
        },
        className
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-white/40">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-5 space-y-3 animate-pulse">
      <div className="h-4 bg-[#1e1e2e] rounded-lg w-3/4 shimmer" />
      <div className="h-3 bg-[#1e1e2e] rounded-lg w-1/2 shimmer" />
      <div className="h-3 bg-[#1e1e2e] rounded-lg w-2/3 shimmer" />
    </div>
  );
}
