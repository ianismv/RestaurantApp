import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'button';
  count?: number;
}

export function SkeletonLoader({ className, variant = 'text', count = 1 }: SkeletonLoaderProps) {
  const variants = {
    card: 'h-32 w-full rounded-xl',
    text: 'h-4 w-full rounded',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-24 rounded-lg',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('skeleton-shimmer', variants[variant], className)}
        />
      ))}
    </>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
          <SkeletonLoader variant="avatar" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader className="w-1/3" />
            <SkeletonLoader className="w-1/2" />
          </div>
          <SkeletonLoader variant="button" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <SkeletonLoader className="w-1/2 h-6" />
      <SkeletonLoader className="w-full" />
      <SkeletonLoader className="w-3/4" />
      <div className="flex gap-2 pt-2">
        <SkeletonLoader variant="button" />
        <SkeletonLoader variant="button" />
      </div>
    </div>
  );
}
