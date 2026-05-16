"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  size?: "sm" | "md";
  className?: string;
}

const SPRING = { type: "spring" as const, stiffness: 280, damping: 22 };

export function ThemeToggle({ size = "md", className = "" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = (resolvedTheme ?? theme ?? "dark") as "dark" | "light";
  const isDark = current === "dark";

  const dim = size === "sm" ? 32 : 36;
  const icon = size === "sm" ? 13 : 14;

  if (!mounted) {
    return (
      <div
        className={className}
        style={{
          width: dim,
          height: dim,
          borderRadius: 12,
          background: "rgba(255,92,0,0.08)",
          border: "1px solid rgba(255,92,0,0.15)",
        }}
      />
    );
  }

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.92 }}
      className={`flex items-center justify-center rounded-xl transition-colors ${className}`}
      style={{
        width: dim,
        height: dim,
        background: "rgba(255,92,0,0.08)",
        border: "1px solid rgba(255,92,0,0.18)",
        color: "#ff5c00",
      }}
    >
      <motion.div
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -30, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={SPRING}
      >
        {isDark ? <Moon size={icon} /> : <Sun size={icon} />}
      </motion.div>
    </motion.button>
  );
}
