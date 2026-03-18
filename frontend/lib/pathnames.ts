import type { Locale } from './types';

/**
 * Locale-specific path slugs for pages that use localized URLs.
 *
 * This mapping is the single source of truth consumed by:
 *  - next-intl middleware (via `routing.pathnames`) for incoming-URL rewrites
 *  - Link generation in components (via `getLocalizedPath`)
 *  - Sitemap and metadata (canonical / hreflang alternates)
 */
export const LOCALIZED_PATHNAMES: Record<
  string,
  Record<Locale, string>
> = {
  '/make-an-appointment': {
    nl: '/afspraak-maken',
    en: '/make-an-appointment',
    de: '/termin-vereinbaren',
  },
};

/**
 * Resolves an internal (file-system) path to the locale-specific external
 * slug.  Paths without a localized variant are returned unchanged.
 */
export function getLocalizedPath(path: string, locale: string): string {
  const variants =
    LOCALIZED_PATHNAMES[path as keyof typeof LOCALIZED_PATHNAMES];
  if (variants) {
    return variants[locale as Locale] ?? path;
  }
  return path;
}
