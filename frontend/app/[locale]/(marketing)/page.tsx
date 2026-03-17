import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Hero } from '@/components/sections/landing/Hero';
import { ServicesOverview } from '@/components/sections/landing/ServicesOverview';
import { TrustSignals } from '@/components/sections/landing/TrustSignals';
import { AboutTeaser } from '@/components/sections/landing/AboutTeaser';
import { Faq, FAQ_ITEM_KEYS } from '@/components/sections/landing/Faq';
import { LandingCta } from '@/components/sections/landing/LandingCta';
import { JsonLd } from '@/components/seo/JsonLd';
import { createMetadata } from '@/lib/metadata';
import { buildFaqPageSchema } from '@/lib/seo';
import type { Locale } from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createMetadata('home', locale as Locale, {
    alternates: {
      canonical: `/${locale}`,
      languages: { nl: '/nl', en: '/en', de: '/de' },
    },
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const tFaq = await getTranslations({ locale, namespace: 'faq' });

  const faqSchema = buildFaqPageSchema(
    FAQ_ITEM_KEYS.map((key) => ({
      question: tFaq(`items.${key}.question`),
      answer: tFaq(`items.${key}.answer`),
    })),
  );

  return (
    <>
      <JsonLd schema={faqSchema} />
      <Hero locale={locale} />
      <ServicesOverview locale={locale} />
      <TrustSignals />
      <AboutTeaser locale={locale} />
      <Faq />
      <LandingCta locale={locale} />
    </>
  );
}
