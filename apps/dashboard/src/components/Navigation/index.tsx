'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ConnectButton } from '@mysten/dapp-kit';

const NAV_LINKS = [
  { label: 'Technology', href: '/' },
  { label: 'Memory', href: '/explorer' },
  { label: 'Agents', href: '/agents' },
  { label: 'Developer', href: '#' },
  { label: 'Docs', href: '#' },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] h-[60px] transition-all duration-300 ease-in-out ${
          scrolled
            ? 'bg-[rgba(8,8,16,0.90)] backdrop-blur-[16px] border-b border-[var(--color-border-default)]'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="h-full px-[20px] flex items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="4" r="3" fill="var(--color-text-primary)" />
              <circle cx="4" cy="20" r="3" fill="var(--color-text-primary)" />
              <circle cx="20" cy="20" r="3" fill="var(--color-text-primary)" />
              <path d="M12 7 L5 17 M12 7 L19 17 M6 20 L18 20" stroke="var(--color-text-primary)" strokeWidth="1.5" />
            </svg>
            <span className="font-heading font-semibold text-[16px] text-[var(--color-text-primary)] tracking-tight">NexusMind</span>
          </Link>

          <div className="flex-1" />

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-[28px]">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative text-[14px] font-medium transition-colors duration-200 ${
                    isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-[21px] left-0 right-0 h-[1px] bg-[var(--color-accent)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:block w-[32px]" />

          {/* Connect Button Desktop */}
          <div className="hidden md:block">
            <ConnectButton className="!bg-transparent !text-[var(--color-accent)] !border !border-[var(--color-accent)] !rounded-[6px] !px-[20px] !py-[9px] !font-body !text-[14px] !font-medium hover:!bg-[var(--color-accent-dim)] transition-colors" />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden ml-4 text-[var(--color-text-primary)] p-2 -mr-2"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-[var(--color-bg-base)]/98 backdrop-blur-xl flex flex-col p-6"
          >
            <div className="flex justify-end mb-8">
              <button
                className="text-[var(--color-text-primary)] p-2 -mr-2"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center h-[48px] text-[18px] font-medium text-[var(--color-text-primary)] border-b border-[var(--color-border-default)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="mt-8 flex justify-center">
              <ConnectButton className="!w-full !bg-transparent !text-[var(--color-accent)] !border !border-[var(--color-accent)] !rounded-[6px] !py-[12px] !font-body !text-[16px] !font-medium hover:!bg-[var(--color-accent-dim)] transition-colors" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
