'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  showSearchIcon?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, showSearchIcon = false, ...props }, ref) => {
    const hasIcon = icon || showSearchIcon;

    return (
      <div className="relative w-full">
        {hasIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon ?? <Search className="h-4 w-4" />}
          </div>
        )}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full rounded-lg border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary',
              'placeholder:text-text-muted',
              'focus:outline-none focus:border-border-accent focus:ring-1 focus:ring-accent/30',
              'transition-colors duration-200',
              hasIcon && 'pl-10',
              className,
            ),
          )}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input, type InputProps };
