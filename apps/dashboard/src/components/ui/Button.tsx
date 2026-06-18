'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const VARIANTS = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-[0_0_20px_var(--color-accent-glow)]',
  secondary:
    'bg-bg-elevated text-text-primary border border-border-default hover:border-border-accent hover:bg-bg-surface',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
} as const;

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
} as const;

type ButtonVariant = keyof typeof VARIANTS;
type ButtonSize = keyof typeof SIZES;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            VARIANTS[variant],
            SIZES[size],
            className,
          ),
        )}
        disabled={disabled ?? isLoading}
        {...(props as any)}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export { Button, type ButtonProps, type ButtonVariant };
