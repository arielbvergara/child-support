import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl bg-surface p-6 shadow-sm border border-border',
          hover &&
            'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
          className
        )
      )}
    >
      {children}
    </div>
  );
}
