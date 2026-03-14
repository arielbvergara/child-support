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
          'rounded-xl bg-surface p-6 shadow-sm border border-border',
          hover &&
            'transition-shadow duration-200 hover:shadow-md',
          className
        )
      )}
    >
      {children}
    </div>
  );
}
