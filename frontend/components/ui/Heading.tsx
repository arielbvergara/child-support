import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type Level = 1 | 2 | 3 | 4;

const levelClasses: Record<Level, string> = {
  1: 'font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl',
  2: 'font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl',
  3: 'font-sans text-xl font-semibold leading-snug sm:text-2xl',
  4: 'font-sans text-lg font-semibold leading-snug',
};

interface HeadingProps {
  level: Level;
  children: React.ReactNode;
  className?: string;
}

export function Heading({ level, children, className }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
  return (
    <Tag
      className={twMerge(clsx('text-foreground', levelClasses[level], className))}
    >
      {children}
    </Tag>
  );
}
