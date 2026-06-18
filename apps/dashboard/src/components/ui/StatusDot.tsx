import { clsx } from 'clsx';

const STATUS_COLORS = {
  active: 'bg-success',
  idle: 'bg-warning',
  error: 'bg-error',
  offline: 'bg-text-muted',
} as const;

type StatusType = keyof typeof STATUS_COLORS;

interface StatusDotProps {
  status: StatusType;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const SIZES = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
} as const;

function StatusDot({ status, pulse = true, size = 'md', label }: StatusDotProps) {
  return (
    <span
      className="relative inline-flex items-center gap-1.5"
      title={label ?? status}
    >
      <span className="relative flex">
        {pulse && status === 'active' && (
          <span
            className={clsx(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-50',
              STATUS_COLORS[status],
            )}
          />
        )}
        <span
          className={clsx(
            'relative inline-flex rounded-full',
            SIZES[size],
            STATUS_COLORS[status],
          )}
        />
      </span>
      {label && (
        <span className="text-xs capitalize text-text-secondary">{label}</span>
      )}
    </span>
  );
}

export { StatusDot, type StatusDotProps, type StatusType };
