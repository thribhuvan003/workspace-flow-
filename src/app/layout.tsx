import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "WorkspaceFlow — One workspace for your entire team",
    template: "%s | WorkspaceFlow",
  },
  description:
    "Real-time project management, Kanban boards, team docs and analytics — all in one workspace built for how teams actually work.",
  keywords: ["project management", "kanban", "team collaboration", "real-time", "workspace"],
  openGraph: {
    type: "website",
    title: "WorkspaceFlow — One workspace for your entire team",
    description: "Real-time project management for modern teams",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable} dark`} suppressHydrationWarning>
      <body className="bg-[#060609] text-white antialiased min-h-screen" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
