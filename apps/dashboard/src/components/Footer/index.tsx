import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-[var(--color-bg-base)] border-t border-[var(--color-border-default)] py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Logo & Tagline */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="4" r="3" fill="var(--color-text-muted)" />
                <circle cx="4" cy="20" r="3" fill="var(--color-text-muted)" />
                <circle cx="20" cy="20" r="3" fill="var(--color-text-muted)" />
                <path d="M12 7 L5 17 M12 7 L19 17 M6 20 L18 20" stroke="var(--color-text-muted)" strokeWidth="1.5" />
              </svg>
              <span className="font-heading font-semibold text-[16px] text-[var(--color-text-muted)] tracking-tight">NexusMind</span>
            </div>
            <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed max-w-xs">
              Verifiable agent memory<br />
              on decentralized infrastructure
            </p>
          </div>
          
          {/* Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[13px] font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Links</h4>
            <Link href="https://github.com/KikiProjecto/NexusMind" className="text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors w-fit">
              GitHub
            </Link>
            <Link href="#" className="text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors w-fit">
              Documentation
            </Link>
            <Link href="https://suiexplorer.com/" target="_blank" className="text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors w-fit">
              Sui Explorer
            </Link>
          </div>

          {/* Stack */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[13px] font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Stack</h4>
            <span className="text-[13px] text-[var(--color-text-muted)]">Walrus</span>
            <span className="text-[13px] text-[var(--color-text-muted)]">MemWal</span>
            <span className="text-[13px] text-[var(--color-text-muted)]">Seal</span>
            <span className="text-[13px] text-[var(--color-text-muted)]">Sui</span>
          </div>

        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-8 border-t border-[var(--color-border-default)]/50 gap-4">
          <span className="text-[13px] text-[var(--color-text-muted)]">
            © 2025 NexusMind. MIT License.
          </span>
        </div>
      </div>
    </footer>
  );
}
