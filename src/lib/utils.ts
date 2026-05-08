import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
}

export const WORKSPACE_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
];

export const PRIORITY_CONFIG = {
  LOW: { label: "Low", color: "#6b7280", bg: "rgba(107,114,128,0.15)" },
  MEDIUM: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  HIGH: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  URGENT: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
} as const;

export const STATUS_CONFIG = {
  TODO: { label: "To Do", color: "#6b7280" },
  IN_PROGRESS: { label: "In Progress", color: "#6366f1" },
  REVIEW: { label: "Review", color: "#f59e0b" },
  DONE: { label: "Done", color: "#10b981" },
} as const;

export const LABEL_COLORS = [
  { name: "Bug", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  { name: "Feature", color: "#6366f1", bg: "rgba(99,102,241,0.15)" },
  { name: "Design", color: "#ec4899", bg: "rgba(236,72,153,0.15)" },
  { name: "Backend", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  { name: "Frontend", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  { name: "Docs", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  { name: "Testing", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
  { name: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
];

export function getLabelColor(label: string) {
  const found = LABEL_COLORS.find((l) => l.name.toLowerCase() === label.toLowerCase());
  return found ?? { color: "#6b7280", bg: "rgba(107,114,128,0.15)" };
}
