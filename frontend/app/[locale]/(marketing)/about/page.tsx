import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { BiographySection } from '@/components/sections/about/BiographySection';
import { QualificationsSection } from '@/components/sections/about/QualificationsSection';
import { PhilosophySection } from '@/components/sections/about/PhilosophySection';
import { JsonLd } from '@/components/seo/JsonLd';
import { createMetadata } from '@/lib/metadata';
import { buildPersonSchema, buildBreadcrumbSchema } from '@/lib/seo';
import type { Locale } from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createMetadata('about', locale as Locale, {
    alternates: {
      canonical: `/${locale}/about`,
      languages: { nl: '/nl/about', en: '/en/about', de: '/de/about' },
    },
  });
}

const BREADCRUMB_NAMES: Record<string, { home: string; about: string }> = {
  nl: { home: 'Home', about: 'Over mij' },
  en: { home: 'Home', about: 'About Me' },
  de: { home: 'Startseite', about: 'Über mich' },
};

function PageHero() {
  const t = useTranslations('about');
  return (
    <div className="bg-gradient-to-br from-sage-50 to-warm-100 py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-warm-900 sm:text-5xl">
          {t('pageTitle')}
        </h1>
      </div>
    </div>
  );
}

function AboutCta({ locale }: { locale: string }) {
  const t = useTranslations('about');
  return (
    <section className="bg-warm-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          {t('ctaTitle')}
        </h2>
        <p className="mt-3 text-warm-600">{t('ctaText')}</p>
        <a
          href={`/${locale}/contact`}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {t('ctaButton')}
        </a>
      </div>
    </section>
  );
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const names = BREADCRUMB_NAMES[locale] ?? BREADCRUMB_NAMES.nl;

  return (
    <>
      <JsonLd schema={buildPersonSchema(locale)} />
      <JsonLd
        schema={buildBreadcrumbSchema(locale, [
          { name: names.home, path: '' },
          { name: names.about, path: '/about' },
        ])}
      />
      <PageHero />
      <BiographySection />
      <QualificationsSection />
      <PhilosophySection />
      <AboutCta locale={locale} />
    </>
  );
}
