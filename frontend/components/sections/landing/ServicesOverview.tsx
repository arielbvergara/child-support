import { useTranslations } from 'next-intl';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { Heading } from '@/components/ui/Heading';
import { ServicesGrid } from '@/components/sections/services/ServicesGrid';

interface ServicesOverviewProps {
  locale: string;
}

export function ServicesOverview({ locale }: ServicesOverviewProps) {
  const t = useTranslations();

  return (
    <SectionWrapper id="services" className="bg-primary-light/30">
      {/* Section header */}
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Heading level={2} className="mb-4">
          {t('services.sectionTitle')}
        </Heading>
        <p className="text-lg text-warm-600">{t('services.sectionSubtitle')}</p>
      </div>

      <ServicesGrid locale={locale} ctaLabel={t('services.learnMore')} />
    </SectionWrapper>
  );
}
