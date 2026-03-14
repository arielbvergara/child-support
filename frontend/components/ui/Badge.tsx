import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type Variant = 'default' | 'sage' | 'warm';

const variantClasses: Record<Variant, string> = {
  default: 'bg-warm-100 text-warm-700',
  sage: 'bg-sage-100 text-sage-700',
  warm: 'bg-warm-200 text-warm-800',
};

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
}

export function Badge({ children, className, variant = 'sage' }: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
          variantClasses[variant],
          className
        )
      )}
    >
      {children}
    </span>
  );
}
