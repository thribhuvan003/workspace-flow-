import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'], variable: '--font-sans',
  weight: ['400','500','600','700','800'], display: 'swap',
});
const serif = Instrument_Serif({
  subsets: ['latin'], variable: '--font-serif',
  weight: ['400'], style: ['normal','italic'], display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'], variable: '--font-mono',
  weight: ['400','500'], display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'WorkspaceFlow — One workspace for your entire team', template: '%s | WorkspaceFlow' },
  description: 'Real-time project management, Kanban boards, team docs and analytics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${serif.variable} ${mono.variable} dark`} suppressHydrationWarning>
      <body className='bg-[#060609] text-white antialiased min-h-screen' suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
