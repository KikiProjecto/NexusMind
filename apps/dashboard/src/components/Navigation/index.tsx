'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Brain } from 'lucide-react';
import { ConnectButton } from '@mysten/dapp-kit';
import { clsx } from 'clsx';
import type { NavLink } from '@/types';

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home', id: 'nav-home' },
  { href: '/explorer', label: 'Explorer', id: 'nav-explorer' },
  { href: '/artifacts', label: 'Artifacts', id: 'nav-artifacts' },
  { href: '/workflows', label: 'Workflows', id: 'nav-workflows' },
  { href: '/agents', label: 'Agents', id: 'nav-agents' },
  { href: '/restore', label: 'Restore', id: 'nav-restore' },
];

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass-panel border-b border-border-default bg-bg-base/80'
          : 'bg-transparent',
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            id="nav-logo"
          >
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-[3px] rounded-full bg-bg-base flex items-center justify-center">
                <Brain className="h-3.5 w-3.5 text-accent" />
              </div>
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-white">
              NexusMind
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.id}
                  href={link.href}
                  id={link.id}
                  className={clsx(
                    'relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    isActive
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5',
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Wallet + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ConnectButton connectText="Connect Wallet" />
            </div>
            <button
              id="nav-mobile-toggle"
              className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden glass-panel border-t border-border-default"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    id={`${link.id}-mobile`}
                    className={clsx(
                      'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-accent bg-accent/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5',
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-border-default">
                <ConnectButton connectText="Connect Wallet" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
