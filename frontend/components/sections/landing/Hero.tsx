import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ArrowDown } from 'lucide-react';

interface HeroProps {
  locale: string;
}

export function Hero({ locale }: HeroProps) {
  const t = useTranslations('hero');

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-br from-primary-light via-background to-sky-50"
    >
      {/* Decorative background elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-sage-200/40 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-coral-200/30 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-48 w-48 rounded-full bg-sky-200/30 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-sky-700 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-sky-500" aria-hidden="true" />
            <span>{t('onlineBadge')} & {t('inPersonBadge')}</span>
          </div>

          {/* Main headline */}
          <h1
            id="hero-heading"
            className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            {t('headline')}
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-warm-600 sm:text-xl">
            {t('subheadline')}
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              href={`/${locale}/contact`}
              variant="primary"
              size="lg"
            >
              {t('ctaPrimary')}
            </Button>
            <Button
              href={`/${locale}#services`}
              variant="ghost"
              size="lg"
            >
              {t('ctaSecondary')}
              <ArrowDown className="ml-1 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-warm-600">
            {[t('trust1'), t('trust2'), t('trust3')].map((item) => (
              <span key={item} className="font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <ArrowDown className="h-5 w-5 text-primary" />
      </div>
    </section>
  );
}
