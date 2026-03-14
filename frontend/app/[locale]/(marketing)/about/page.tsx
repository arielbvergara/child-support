import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { BiographySection } from '@/components/sections/about/BiographySection';
import { QualificationsSection } from '@/components/sections/about/QualificationsSection';
import { PhilosophySection } from '@/components/sections/about/PhilosophySection';
import { JsonLd } from '@/components/seo/JsonLd';
import { createMetadata } from '@/lib/metadata';
import { SITE_CONFIG } from '@/lib/constants';
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

function buildPersonSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_CONFIG.siteUrl}/#person`,
    name: 'Pedagogisch Adviseur',
    jobTitle: 'Pedagoog / Pedagogisch Adviseur',
    description:
      'Met meer dan tien jaar ervaring in de pedagogische begeleiding help ik kinderen en gezinnen bij hun ontwikkeling.',
    url: `${SITE_CONFIG.siteUrl}/${locale}/about`,
    worksFor: {
      '@id': `${SITE_CONFIG.siteUrl}/#business`,
    },
    knowsLanguage: ['nl', 'en', 'de'],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'degree',
        name: 'Master Pedagogische Wetenschappen (M.Ed.)',
        recognizedBy: {
          '@type': 'Organization',
          name: 'Universiteit van Amsterdam',
        },
        dateCreated: '2012',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'certificate',
        name: 'Postdoctoraal certificaat Gezinstherapie',
        dateCreated: '2015',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'certificate',
        name: 'Opleiding Ontwikkelingspsychologie Kinderen',
        dateCreated: '2018',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'license',
        name: 'NIP-geregistreerd pedagoog',
        dateCreated: '2020',
      },
    ],
  };
}

function buildBreadcrumbSchema(locale: string) {
  const breadcrumbNames: Record<string, { home: string; about: string }> = {
    nl: { home: 'Home', about: 'Over mij' },
    en: { home: 'Home', about: 'About Me' },
    de: { home: 'Startseite', about: 'Über mich' },
  };
  const names = breadcrumbNames[locale] ?? breadcrumbNames.nl;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: names.home,
        item: `${SITE_CONFIG.siteUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: names.about,
        item: `${SITE_CONFIG.siteUrl}/${locale}/about`,
      },
    ],
  };
}

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

  return (
    <>
      <JsonLd schema={buildPersonSchema(locale)} />
      <JsonLd schema={buildBreadcrumbSchema(locale)} />
      <PageHero />
      <BiographySection />
      <QualificationsSection />
      <PhilosophySection />
      <AboutCta locale={locale} />
    </>
  );
}
