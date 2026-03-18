import { useTranslations } from 'next-intl';
import { GraduationCap } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { SectionWrapper } from '@/components/ui/SectionWrapper';
import { PROFESSIONAL_INFO } from '@/lib/constants';

export function BiographySection() {
  const t = useTranslations('about.biography');

  return (
    <SectionWrapper className="bg-white">
      <div className="grid items-start gap-12 md:grid-cols-5 lg:gap-16">
        {/* Photo placeholder */}
        <div className="md:col-span-2">
          <div
            className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-sage-100 to-warm-200 shadow-lg"
            aria-label="Photo of the pedagogy professional"
          >
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-200 text-sage-600">
                <GraduationCap className="h-10 w-10" aria-hidden="true" />
              </div>
              <p className="text-sm text-warm-500">Foto volgt binnenkort</p>
            </div>
          </div>
        </div>

        {/* Bio content */}
        <div className="md:col-span-3">
          <Heading level={2} className="mb-2">
            {t('title')}
          </Heading>
          {PROFESSIONAL_INFO.name && (
            <p className="mb-6 text-base font-semibold text-warm-900">
              {PROFESSIONAL_INFO.name}
            </p>
          )}

          <p className="mb-5 text-base leading-relaxed text-warm-700">
            {t('paragraph1')}
          </p>

          {/* Pull quote */}
          <blockquote className="my-8 border-l-4 border-primary pl-5">
            <p className="font-display text-lg font-medium italic text-warm-800 leading-relaxed">
              &ldquo;{t('pullQuote')}&rdquo;
            </p>
          </blockquote>

          <p className="text-base leading-relaxed text-warm-700">
            {t('paragraph2')}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
