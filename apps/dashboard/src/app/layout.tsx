import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'NexusMind — Decentralized Multi-Agent Intelligence',
  description:
    'Verifiable, decentralized multi-agent coordination platform with persistent memory, Seal encryption, and onchain provenance on Sui.',
  keywords: ['NexusMind', 'Sui', 'Walrus', 'MemWal', 'AI Agents', 'Decentralized Intelligence'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-bg-base">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Sora:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-base text-text-primary min-h-screen antialiased">
        <Providers>
          <Navigation />
          <main className="pt-16 min-h-screen flex flex-col">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
