import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WorkspaceFlow — One workspace for your entire team",
    template: "%s | WorkspaceFlow",
  },
  description:
    "Real-time project management, Kanban boards, team docs and analytics — all in one beautiful workspace.",
  keywords: ["project management", "kanban", "team collaboration", "real-time"],
  openGraph: {
    type: "website",
    title: "WorkspaceFlow — One workspace for your entire team",
    description: "Real-time project management for modern teams",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="bg-[#0a0a0f] text-white antialiased min-h-screen font-[var(--font-inter)]" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
