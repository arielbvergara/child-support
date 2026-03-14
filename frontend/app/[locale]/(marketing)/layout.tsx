import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { CONTACT_INFO, SITE_CONFIG } from '@/lib/constants';

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_CONFIG.siteUrl}/#business`,
  name: SITE_CONFIG.name,
  description:
    'Professionele pedagogische begeleiding voor kinderen en gezinnen.',
  url: SITE_CONFIG.siteUrl,
  telephone: CONTACT_INFO.phone,
  email: CONTACT_INFO.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTACT_INFO.addressLine1,
    addressLocality: 'Amsterdam',
    postalCode: '1234 AB',
    addressCountry: 'NL',
  },
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
  priceRange: '$$',
  image: `${SITE_CONFIG.siteUrl}/images/og-image.jpg`,
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
      <JsonLd schema={localBusinessSchema} />
      <SkipLink />
      <Header locale={locale} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer locale={locale} />
    </>
  );
}
