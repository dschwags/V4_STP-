import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { getUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import Header from '@/components/header';
import { ThemeProvider } from '@/contexts/theme-context';
import { siteConfig } from '@/lib/config';
import { DebugSessionState } from '@/components/debug-session-state';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description
};

export const viewport: Viewport = {
  maximumScale: 1
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.className}`}
    >
      <body className="min-h-[100dvh] bg-background text-foreground">
        <ThemeProvider>
          <SWRConfig
            value={{
              fallback: {
                // BugX: Re-enabled after successful database setup
                '/api/user': getUser()
              }
            }}
          >
            <div className="flex flex-col min-h-screen">
              <Header />
              {children}
              <DebugSessionState />
            </div>
          </SWRConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
