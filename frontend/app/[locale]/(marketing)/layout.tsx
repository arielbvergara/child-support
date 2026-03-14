import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { CONTACT_INFO, SITE_CONFIG } from '@/lib/constants';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_CONFIG.siteUrl}/#website`,
  url: SITE_CONFIG.siteUrl,
  name: SITE_CONFIG.name,
  description:
    'Professionele pedagogische begeleiding voor kinderen en gezinnen.',
  inLanguage: ['nl', 'en', 'de'],
};

const professionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': ['ProfessionalService', 'LocalBusiness'],
  '@id': `${SITE_CONFIG.siteUrl}/#business`,
  name: SITE_CONFIG.name,
  description:
    'Professionele pedagogische begeleiding voor kinderen en gezinnen.',
  url: SITE_CONFIG.siteUrl,
  telephone: CONTACT_INFO.phone,
  email: CONTACT_INFO.email,
  image: `${SITE_CONFIG.siteUrl}/images/og-image.jpg`,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTACT_INFO.addressLine1,
    addressLocality: 'Amsterdam',
    postalCode: '1234 AB',
    addressCountry: 'NL',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 52.3676,
    longitude: 4.9041,
  },
  areaServed: {
    '@type': 'Country',
    name: 'Netherlands',
  },
  knowsLanguage: ['nl', 'en', 'de'],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '10:00',
      closes: '14:00',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Pedagogische Diensten',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Individueel Consult',
          description:
            'Persoonlijke één-op-één sessies met ouders of gezinnen, online of persoonlijk.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Groepsworkshops',
          description:
            'Interactieve workshops over opvoeding, ontwikkeling en gezinsrelaties.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Kinderbeoordeling',
          description:
            'Professionele ontwikkelingsbeoordelingen voor kinderen.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'School- en Leerkrachtbegeleiding',
          description:
            'Ondersteuning voor scholen, leerkrachten en educatieve instellingen.',
        },
      },
    ],
  },
  sameAs: [
    // Add social profile URLs here when available
  ],
};

interface MarketingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

function SkipLink() {
  const t = useTranslations('common');
  return (
    <a href="#main-content" className="skip-link">
      {t('skipToContent')}
    </a>
  );
}

export default async function MarketingLayout({
  children,
  params,
}: MarketingLayoutProps) {
  const { locale } = await params;

  return (
    <>
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={professionalServiceSchema} />
      <SkipLink />
      <Header locale={locale} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer locale={locale} />
    </>
  );
}
