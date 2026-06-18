import Link from 'next/link';
import { Brain, BookOpen, ExternalLink } from 'lucide-react';

const TECH_STACK = [
  { name: 'Walrus', desc: 'Decentralized storage' },
  { name: 'Sui', desc: 'Smart contract platform' },
  { name: 'Seal', desc: 'Threshold encryption' },
  { name: 'MemWal', desc: 'Persistent AI memory' },
];

const RESOURCE_LINKS = [
  { label: 'Documentation', href: '/docs', id: 'footer-docs' },
  { label: 'SDK Reference', href: '/docs/sdk', id: 'footer-sdk' },
  { label: 'GitHub', href: 'https://github.com/nexusmind', id: 'footer-github', external: true },
  { label: 'Architecture', href: '/docs/architecture', id: 'footer-arch' },
];

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-bg-surface/50 mt-auto" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative h-7 w-7">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-purple-500 opacity-80" />
                <div className="absolute inset-[2.5px] rounded-full bg-bg-base flex items-center justify-center">
                  <Brain className="h-3 w-3 text-accent" />
                </div>
              </div>
              <span className="font-heading font-bold text-base text-white">NexusMind</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              Verifiable, decentralized multi-agent coordination platform with persistent memory.
              Where agents remember, reason, and persist across the decentralized web.
            </p>
          </div>

          {/* Technology */}
          <div className="space-y-4">
            <h3 className="text-sm font-heading font-semibold text-white uppercase tracking-wider">
              Technology
            </h3>
            <ul className="space-y-2.5">
              {TECH_STACK.map((tech) => (
                <li key={tech.name} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                  <span className="text-sm text-text-primary">{tech.name}</span>
                  <span className="text-xs text-text-muted">— {tech.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-heading font-semibold text-white uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.id}>
                  {link.external ? (
                    <a
                      href={link.href}
                      id={link.id}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                      {link.label === 'GitHub' ? (
                        <BookOpen className="h-3.5 w-3.5" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      id={link.id}
                      className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border-default flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            &copy; 2025 NexusMind. Built for the Sui ecosystem.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>Powered by Walrus &amp; Sui</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
