'use client';

import { type HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glowOnHover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = true, glowOnHover = true, padding = 'md', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverable ? { y: -2 } : undefined}
        className={twMerge(
          clsx(
            'glass-panel rounded-xl transition-all duration-300',
            PADDING[padding],
            hoverable && 'cursor-pointer',
            glowOnHover && 'hover:border-border-accent hover:shadow-[0_0_30px_var(--color-accent-glow)]',
            className,
          ),
        )}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  },
);

Card.displayName = 'Card';

export { Card, type CardProps };
