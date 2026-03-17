import { useTranslations } from 'next-intl';
import { AppointmentForm } from '@/components/ui/AppointmentForm';

export function AppointmentFormSection() {
  const t = useTranslations('appointment.form');

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">
        {t('title')}
      </h2>
      <p className="text-warm-600 mb-8">{t('subtitle')}</p>
      <AppointmentForm />
    </div>
  );
}
