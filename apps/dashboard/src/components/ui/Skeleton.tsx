import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps {
  className?: string;
  lines?: number;
  lineHeight?: string;
}

function Skeleton({ className, lines = 1, lineHeight = 'h-4' }: SkeletonProps) {
  if (lines === 1) {
    return (
      <div
        className={twMerge(clsx('skeleton', lineHeight, 'w-full', className))}
        role="status"
        aria-label="Loading"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={twMerge(
            clsx(
              'skeleton',
              lineHeight,
              i === lines - 1 ? 'w-3/4' : 'w-full',
              className,
            ),
          )}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={twMerge(
        clsx('glass-panel rounded-xl p-6 space-y-4', className),
      )}
      role="status"
      aria-label="Loading"
    >
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-3 w-1/4" />
        </div>
      </div>
      <Skeleton lines={3} />
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading table">
      <div className="skeleton h-10 w-full rounded-lg" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable };
