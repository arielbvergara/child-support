import { useTranslations } from 'next-intl';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { Heading } from '@/components/ui/Heading';

export const FAQ_ITEM_KEYS = ['1', '2', '3', '4', '5'] as const;

export function Faq() {
  const t = useTranslations('faq');

  return (
    <SectionWrapper className="bg-warm-50">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Heading level={2} className="mb-3">
          {t('sectionTitle')}
        </Heading>
        <p className="text-warm-600">{t('sectionSubtitle')}</p>
      </div>

      <div className="mx-auto max-w-3xl divide-y divide-border">
        {FAQ_ITEM_KEYS.map((key) => (
          <details
            key={key}
            className="group py-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-md">
              {t(`items.${key}.question`)}
              <span
                aria-hidden="true"
                className="ml-4 flex-shrink-0 text-xl font-light text-warm-400 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-warm-600 leading-relaxed">
              {t(`items.${key}.answer`)}
            </p>
          </details>
        ))}
      </div>
    </SectionWrapper>
  );
}
