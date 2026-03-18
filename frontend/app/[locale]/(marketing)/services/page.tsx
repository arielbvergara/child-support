import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { JsonLd } from '@/components/seo/JsonLd';
import { ServicesGrid } from '@/components/sections/services/ServicesGrid';
import { createMetadata } from '@/lib/metadata';
import { buildBreadcrumbSchema } from '@/lib/seo';
import { SERVICE_PAGES, SITE_CONFIG } from '@/lib/constants';
import type { Locale } from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createMetadata('services', locale as Locale, {
    alternates: {
      canonical: `/${locale}/services`,
      languages: { nl: '/nl/services', en: '/en/services', de: '/de/services' },
    },
  });
}

const BREADCRUMB_NAMES: Record<string, { home: string; services: string }> = {
  nl: { home: 'Home', services: 'Diensten' },
  en: { home: 'Home', services: 'Services' },
  de: { home: 'Startseite', services: 'Leistungen' },
};

function buildCollectionPageSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name:
      locale === 'de'
        ? 'Leistungen'
        : locale === 'en'
          ? 'Services'
          : 'Diensten',
    url: `${SITE_CONFIG.siteUrl}/${locale}/services`,
    isPartOf: { '@id': `${SITE_CONFIG.siteUrl}/#website` },
    provider: { '@id': `${SITE_CONFIG.siteUrl}/#business` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: SERVICE_PAGES.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_CONFIG.siteUrl}/${locale}/services/${s.slug}`,
      })),
    },
  };
}

function PageHero() {
  const t = useTranslations('servicesPage');
  return (
    <div className="bg-gradient-to-br from-sage-50 to-warm-100 py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-warm-900 sm:text-5xl">
          {t('pageTitle')}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-warm-600">
          {t('pageSubtitle')}
        </p>
      </div>
    </div>
  );
}

function ServicesList({ locale }: { locale: string }) {
  const tPage = useTranslations('servicesPage');

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <p className="mx-auto mb-12 max-w-3xl text-center text-lg leading-relaxed text-warm-700">
        {tPage('intro')}
      </p>
      <ServicesGrid locale={locale} ctaLabel={tPage('exploreService')} />
    </section>
  );
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;
  const names = BREADCRUMB_NAMES[locale] ?? BREADCRUMB_NAMES.nl;

  return (
    <>
      <JsonLd schema={buildCollectionPageSchema(locale)} />
      <JsonLd
        schema={buildBreadcrumbSchema(locale, [
          { name: names.home, path: '' },
          { name: names.services, path: '/services' },
        ])}
      />
      <PageHero />
      <ServicesList locale={locale} />
    </>
  );
}
