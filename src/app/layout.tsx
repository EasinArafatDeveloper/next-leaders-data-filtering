import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Data Management & Intelligence Dashboard',
  description:
    'Premium data management, filtering, analytics and export dashboard. Upload CSV/Excel → Explore → Filter → Download.',
  icons: {
    icon: '/Logo_Next_new.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/Logo_Next_new.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;1,14..32,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#F7F8FA] dark:bg-[#0B0F19] transition-colors duration-200">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
