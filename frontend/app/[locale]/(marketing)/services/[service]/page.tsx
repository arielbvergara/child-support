import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Monitor, MapPin } from 'lucide-react';
import { VideoEmbed } from '@/components/ui/VideoEmbed';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/seo';
import { createMetadata } from '@/lib/metadata';
import { SERVICE_PAGES, SITE_CONFIG } from '@/lib/constants';
import type { Locale, ServicePageConfig } from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string; service: string }>;
}

export function generateStaticParams() {
  return SERVICE_PAGES.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, service } = await params;
  const serviceConfig = SERVICE_PAGES.find((s) => s.slug === service);
  if (!serviceConfig) return {};

  return createMetadata(`services/${service}`, locale as Locale, {
    alternates: {
      canonical: `/${locale}/services/${service}`,
      languages: Object.fromEntries(
        SITE_CONFIG.locales.map((l) => [l, `/${l}/services/${service}`])
      ),
    },
  });
}

const BREADCRUMB_LABELS: Record<string, { services: string }> = {
  nl: { services: 'Diensten' },
  en: { services: 'Services' },
  de: { services: 'Leistungen' },
};

function buildServiceSchema(
  locale: string,
  serviceSlug: string,
  title: string,
  description: string,
  online: boolean,
  inPerson: boolean,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description,
    provider: {
      '@id': `${SITE_CONFIG.siteUrl}/#person`,
    },
    url: `${SITE_CONFIG.siteUrl}/${locale}/services/${serviceSlug}`,
    availableChannel: [
      ...(online
        ? [{ '@type': 'ServiceChannel', serviceType: 'Online' }]
        : []),
      ...(inPerson
        ? [{ '@type': 'ServiceChannel', serviceType: 'InPerson' }]
        : []),
    ],
  };
}

interface ServiceHeroProps {
  serviceConfig: ServicePageConfig;
  serviceId: string;
}

function ServiceHero({ serviceConfig, serviceId }: ServiceHeroProps) {
  const t = useTranslations(`servicePage.${serviceId}`);
  const tCommon = useTranslations('common');
  const tService = useTranslations(`services.${serviceId}`);

  return (
    <div className="bg-gradient-to-br from-sage-50 to-warm-100 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {serviceConfig.online && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
              {tCommon('online')}
            </span>
          )}
          {serviceConfig.inPerson && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-100 px-3 py-1 text-xs font-semibold text-coral-700">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {tCommon('inPerson')}
            </span>
          )}
        </div>
        <h1 className="font-display text-4xl font-bold text-warm-900 sm:text-5xl">
          {tService('title')}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-warm-600">
          {t('tagline')}
        </p>
      </div>
    </div>
  );
}

interface ServiceBodyProps {
  serviceId: string;
}

function ServiceBody({ serviceId }: ServiceBodyProps) {
  const t = useTranslations(`servicePage.${serviceId}`);

  const expectationItems = [
    t('whatToExpect.item1'),
    t('whatToExpect.item2'),
    t('whatToExpect.item3'),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      {/* Intro + Video */}
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="text-lg leading-relaxed text-warm-700">{t('description')}</p>
        </div>
        <VideoEmbed videoId={t('videoId')} title={t('videoTitle')} />
      </div>

      {/* What to Expect + Who Is This For */}
      <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:mt-20 lg:gap-16">
        {/* What to Expect */}
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="font-display text-xl font-bold text-foreground">
            {t('whatToExpect.title')}
          </h2>
          <ul className="mt-6 space-y-4" role="list">
            {expectationItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="text-warm-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Who Is This For */}
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="font-display text-xl font-bold text-foreground">
            {t('whoIsItFor.title')}
          </h2>
          <p className="mt-4 leading-relaxed text-warm-700">{t('whoIsItFor.text')}</p>
        </div>
      </div>
    </div>
  );
}

interface ServiceCtaProps {
  serviceId: string;
  locale: string;
}

function ServiceCta({ serviceId, locale }: ServiceCtaProps) {
  const t = useTranslations(`servicePage.${serviceId}`);
  const tNav = useTranslations('nav');

  return (
    <section className="bg-sage-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          {t('cta.title')}
        </h2>
        <p className="mt-3 text-warm-600">{t('cta.text')}</p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button href={`/${locale}/make-an-appointment`} variant="primary" size="lg">
            {t('cta.button')}
          </Button>
          <Button href={`/${locale}/contact`} variant="secondary" size="lg">
            {tNav('contact')}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default async function ServicePage({ params }: PageProps) {
  const { locale, service } = await params;
  const serviceConfig = SERVICE_PAGES.find((s) => s.slug === service);
  if (!serviceConfig) notFound();

  const t = await getTranslations({ locale, namespace: `servicePage.${serviceConfig.id}` });
  const tService = await getTranslations({ locale, namespace: `services.${serviceConfig.id}` });
  const labels = BREADCRUMB_LABELS[locale] ?? BREADCRUMB_LABELS.nl;

  const serviceSchema = buildServiceSchema(
    locale,
    service,
    tService('title'),
    t('description'),
    serviceConfig.online,
    serviceConfig.inPerson,
  );

  return (
    <>
      <JsonLd schema={serviceSchema} />
      <JsonLd
        schema={buildBreadcrumbSchema(locale, [
          { name: 'Home', path: '' },
          { name: labels.services, path: '/services' },
          { name: tService('title'), path: `/services/${service}` },
        ])}
      />
      <ServiceHero serviceConfig={serviceConfig} serviceId={serviceConfig.id} />
      <ServiceBody serviceId={serviceConfig.id} />
      <ServiceCta serviceId={serviceConfig.id} locale={locale} />
    </>
  );
}
