import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { ContactInfo } from '@/components/sections/contact/ContactInfo';
import { ContactFormSection } from '@/components/sections/contact/ContactFormSection';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { JsonLd } from '@/components/seo/JsonLd';
import { createMetadata } from '@/lib/metadata';
import { buildBreadcrumbSchema } from '@/lib/seo';
import type { Locale } from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createMetadata('contact', locale as Locale, {
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { nl: '/nl/contact', en: '/en/contact', de: '/de/contact' },
    },
  });
}

const BREADCRUMB_NAMES: Record<string, { home: string; contact: string }> = {
  nl: { home: 'Home', contact: 'Contact' },
  en: { home: 'Home', contact: 'Contact' },
  de: { home: 'Startseite', contact: 'Kontakt' },
};

function PageHero() {
  const t = useTranslations('contact');
  return (
    <div className="bg-gradient-to-br from-sage-50 to-warm-100 py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-warm-900 sm:text-5xl">
          {t('pageTitle')}
        </h1>
        <p className="mt-3 text-lg text-warm-600">{t('pageSubtitle')}</p>
      </div>
    </div>
  );
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const names = BREADCRUMB_NAMES[locale] ?? BREADCRUMB_NAMES.nl;

  return (
    <>
      <JsonLd
        schema={buildBreadcrumbSchema(locale, [
          { name: names.home, path: '' },
          { name: names.contact, path: '/contact' },
        ])}
      />
      <PageHero />
      <SectionWrapper className="bg-white">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <ContactInfo />
          </div>
          <div className="lg:col-span-3">
            <ContactFormSection />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
