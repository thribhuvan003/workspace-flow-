"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const light = resolvedTheme === "light";
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: light ? "#ede2d0" : "#16161f",
          color: light ? "#1a1208" : "#f0f0f5",
          border: light ? "1px solid #d6c6a8" : "1px solid #2a2a3e",
          borderRadius: "12px",
          fontSize: "14px",
          boxShadow: light ? "0 10px 40px rgba(0,0,0,0.12)" : "0 10px 40px rgba(0,0,0,0.5)",
        },
        success: {
          iconTheme: { primary: "#10b981", secondary: light ? "#ede2d0" : "#fff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: light ? "#ede2d0" : "#fff" },
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
        <ThemedToaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
