import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { AppointmentForm } from '@/components/ui/AppointmentForm';
import { FormSection } from '@/components/ui/FormSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { createMetadata } from '@/lib/metadata';
import { buildBreadcrumbSchema } from '@/lib/seo';
import { LOCALIZED_PATHNAMES, getLocalizedPath } from '@/lib/pathnames';
import type { Locale } from '@/lib/types';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const appointmentPaths = LOCALIZED_PATHNAMES['/make-an-appointment'];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createMetadata('appointment', locale as Locale, {
    alternates: {
      canonical: getLocalizedPath('/make-an-appointment', locale),
      languages: {
        nl: `/nl${appointmentPaths.nl}`,
        en: `/en${appointmentPaths.en}`,
        de: `/de${appointmentPaths.de}`,
      },
    },
  });
}

const BREADCRUMB_NAMES: Record<string, { home: string; appointment: string }> = {
  nl: { home: 'Home', appointment: 'Maak een afspraak' },
  en: { home: 'Home', appointment: 'Make an Appointment' },
  de: { home: 'Startseite', appointment: 'Termin vereinbaren' },
};

function PageHero() {
  const t = useTranslations('appointment');
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

function AppointmentFormContent() {
  const t = useTranslations('appointment.form');
  return (
    <FormSection title={t('title')} subtitle={t('subtitle')}>
      <AppointmentForm />
    </FormSection>
  );
}

export default async function MakeAnAppointmentPage({ params }: PageProps) {
  const { locale } = await params;
  const names = BREADCRUMB_NAMES[locale] ?? BREADCRUMB_NAMES.nl;

  return (
    <>
      <JsonLd
        schema={buildBreadcrumbSchema(locale, [
          { name: names.home, path: '' },
          { name: names.appointment, path: getLocalizedPath('/make-an-appointment', locale) },
        ])}
      />
      <PageHero />
      <SectionWrapper className="bg-white">
        <div className="mx-auto max-w-2xl">
          <AppointmentFormContent />
        </div>
      </SectionWrapper>
    </>
  );
}
