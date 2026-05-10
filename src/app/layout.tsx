import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Bricolage_Grotesque, Space_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'WorkspaceFlow — One workspace for your entire team', template: '%s | WorkspaceFlow' },
  description: 'Real-time project management. Kanban boards, live docs, team presence, and sprint analytics in one workspace.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${bricolage.variable} ${spaceMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-[#060609] text-white antialiased min-h-screen" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
