import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Clock, Info } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

export function ContactInfo() {
  const t = useTranslations();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">
          {t('contact.info.title')}
        </h2>

        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-primary">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-warm-500">
                E-mail
              </p>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="text-base font-medium text-foreground transition-colors hover:text-primary"
              >
                {CONTACT_INFO.email}
              </a>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-primary">
              <Phone className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-warm-500">
                Telefoon
              </p>
              <a
                href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
                className="text-base font-medium text-foreground transition-colors hover:text-primary"
              >
                {CONTACT_INFO.phone}
              </a>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-primary">
              <MapPin className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-warm-500">
                Adres
              </p>
              <address className="not-italic text-base font-medium text-foreground">
                {CONTACT_INFO.addressLine1}
                <br />
                {CONTACT_INFO.postalCode} {CONTACT_INFO.city}
              </address>
            </div>
          </li>
        </ul>
      </div>

      {/* Office hours */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="font-semibold text-foreground">{t('contact.hours.title')}</h3>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {CONTACT_INFO.hours.map((row) => (
              <tr key={row.dayKey}>
                <td className="py-2 font-medium text-warm-700">
                  {t(row.dayKey as Parameters<typeof t>[0])}
                </td>
                <td className="py-2 text-right text-warm-600">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Response time note */}
      <div className="flex items-start gap-2 rounded-lg bg-sage-50 p-4 text-sm text-sage-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>{t('contact.info.responseTime')}</p>
      </div>
    </div>
  );
}
