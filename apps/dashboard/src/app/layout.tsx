import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';

export const metadata: Metadata = {
  title: 'NexusMind Dashboard',
  description: 'Decentralized multi-agent coordination platform with persistent memory.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen bg-nexus-dark text-nexus-light selection:bg-nexus-cyan selection:text-nexus-dark">
            <nav className="fixed top-0 w-full glass-panel z-50 border-b border-white/5">
              <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nexus-cyan to-nexus-teal flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-nexus-dark" />
                  </div>
                  <span className="font-heading font-bold text-xl tracking-tight text-white">NexusMind</span>
                </div>
                <div className="flex items-center gap-6">
                  <a href="#agents" className="text-sm font-medium hover:text-nexus-cyan transition-colors">Agents</a>
                  <a href="#memory" className="text-sm font-medium hover:text-nexus-cyan transition-colors">Memory Explorer</a>
                  <a href="#artifacts" className="text-sm font-medium hover:text-nexus-cyan transition-colors">Artifacts</a>
                  <div id="wallet-button-container"></div>
                </div>
              </div>
            </nav>
            <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
