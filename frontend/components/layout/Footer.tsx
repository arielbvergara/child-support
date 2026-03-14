import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin } from 'lucide-react';
import { NAV_LINKS, CONTACT_INFO, SITE_CONFIG } from '@/lib/constants';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-sage-200 bg-warm-900 text-warm-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold text-white">
                {SITE_CONFIG.name}
              </span>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-warm-300">
              {t('footer.tagline')}
            </p>

            {/* Contact quick links */}
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-2 text-warm-300 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-warm-300 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2 text-warm-300">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {CONTACT_INFO.addressLine1}
                    <br />
                    {CONTACT_INFO.addressLine2}
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-warm-300">
              {t('footer.navigation')}
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => {
                const [path, hash] = link.href.split('#');
                let localizedHref = `/${locale}${path === '/' ? '' : path}`;

                if (hash) {
                  localizedHref += `#${hash}`;
                }

                return (
                  <li key={link.href}>
                    <Link
                      href={localizedHref}
                      className="text-sm text-warm-300 transition-colors hover:text-white"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-warm-300">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/privacy-policy`}
                  className="text-sm text-warm-300 transition-colors hover:text-white"
                >
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms-of-service`}
                  className="text-sm text-warm-300 transition-colors hover:text-white"
                >
                  {t('footer.termsOfService')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Language column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-warm-300">
              Language / Taal / Sprache
            </h3>
            <ul className="space-y-2">
              {([['nl', 'Nederlands'], ['en', 'English'], ['de', 'Deutsch']] as const).map(
                ([loc, label]) => (
                  <li key={loc}>
                    <Link
                      href={`/${loc}`}
                      className={`text-sm transition-colors ${
                        loc === locale
                          ? 'font-semibold text-sage-300'
                          : 'text-warm-300 hover:text-white'
                      }`}
                      aria-current={loc === locale ? 'true' : undefined}
                    >
                      {label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-warm-700 pt-8">
          <p className="text-center text-xs text-warm-400">
            &copy; {currentYear} {SITE_CONFIG.name}. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
