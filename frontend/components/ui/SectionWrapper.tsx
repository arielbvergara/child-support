import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ElementType } from 'react';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
  as?: ElementType;
}

export function SectionWrapper({
  children,
  className,
  innerClassName,
  id,
  as: Tag = 'section',
}: SectionWrapperProps) {
  return (
    <Tag
      id={id}
      className={twMerge(clsx('py-16 md:py-20 lg:py-24', className))}
    >
      <div
        className={twMerge(
          clsx('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', innerClassName)
        )}
      >
        {children}
      </div>
    </Tag>
  );
}
