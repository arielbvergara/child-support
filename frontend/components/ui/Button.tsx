import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'white';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  secondary:
    'bg-secondary text-warm-900 hover:bg-warm-300 focus-visible:ring-2 focus-visible:ring-warm-400 focus-visible:ring-offset-2',
  ghost:
    'bg-transparent text-primary border border-primary hover:bg-primary-light focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  white:
    'bg-white text-primary hover:bg-sage-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm min-h-[36px]',
  md: 'px-6 py-3 text-base min-h-[44px]',
  lg: 'px-8 py-4 text-lg min-h-[52px]',
};

type ButtonBaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = ButtonBaseProps & { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'className'>;
type ButtonAsButton = ButtonBaseProps & { href?: undefined } & Omit<ComponentPropsWithoutRef<'button'>, 'className'>;

type ButtonProps = ButtonAsLink | ButtonAsButton;

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = twMerge(
    clsx(
      'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 cursor-pointer select-none',
      variantClasses[variant],
      sizeClasses[size],
      className
    )
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...(props as Omit<ComponentPropsWithoutRef<typeof Link>, 'href' | 'className'>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as Omit<ComponentPropsWithoutRef<'button'>, 'className'>)}>
      {children}
    </button>
  );
}
