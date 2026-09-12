// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'US Climate & Energy Policy Agent',
  description: 'AI-powered analysis of US climate and energy policy positions and international statements',
  keywords: ['climate policy', 'energy', 'US foreign policy', 'UN', 'international relations'],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-slate-50">
        {children}
      </body>
    </html>
  );
}
