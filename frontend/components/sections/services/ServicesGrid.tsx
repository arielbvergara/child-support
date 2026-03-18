import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  ClipboardList,
  School,
  ArrowRight,
  Monitor,
  MapPin,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SERVICE_CATALOG } from '@/lib/constants';

const iconMap = {
  Users,
  BookOpen,
  ClipboardList,
  School,
} as const;

const iconColorClasses = [
  'bg-sage-100 text-primary',
  'bg-coral-100 text-coral-600',
  'bg-sky-100 text-sky-700',
  'bg-warm-200 text-warm-700',
] as const;

interface ServicesGridProps {
  locale: string;
  ctaLabel: string;
}

export function ServicesGrid({ locale, ctaLabel }: ServicesGridProps) {
  const t = useTranslations();
  const tCommon = useTranslations('common');

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {SERVICE_CATALOG.map((service, index) => {
        const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Users;
        const iconColor = iconColorClasses[index % iconColorClasses.length];

        return (
          <Card key={service.id} hover className="relative flex flex-col">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconColor}`}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5">
              {service.online && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                  <Monitor className="h-3 w-3" aria-hidden="true" />
                  {tCommon('online')}
                </span>
              )}
              {service.inPerson && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warm-100 px-2 py-0.5 text-xs font-medium text-warm-700">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {tCommon('inPerson')}
                </span>
              )}
            </div>

            <h3 className="mb-2 font-sans text-lg font-semibold text-foreground">
              {t(service.titleKey as Parameters<typeof t>[0])}
            </h3>
            <p className="flex-1 text-sm leading-relaxed text-warm-600">
              {t(service.descriptionKey as Parameters<typeof t>[0])}
            </p>

            <Link
              href={`/${locale}/services/${service.slug}`}
              aria-label={`${ctaLabel} — ${t(service.titleKey as Parameters<typeof t>[0])}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover after:absolute after:inset-0 after:rounded-2xl after:content-['']"
            >
              {ctaLabel}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
