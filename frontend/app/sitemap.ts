import type { MetadataRoute } from 'next';
import { SERVICE_CATALOG, SITE_CONFIG } from '@/lib/constants';
import { getLocalizedPath } from '@/lib/pathnames';

const serviceEntries = SERVICE_CATALOG.map((service) => ({
  path: `/services/${service.slug}`,
  priority: 0.9,
  changeFrequency: 'monthly' as const,
}));

const INDEXABLE_PAGES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/make-an-appointment', priority: 0.7, changeFrequency: 'monthly' as const },
  ...serviceEntries,
];

export default function sitemap(): MetadataRoute.Sitemap {
  const { locales, siteUrl } = SITE_CONFIG;

  return INDEXABLE_PAGES.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((locale) => {
      const localizedPath = getLocalizedPath(path, locale);
      return {
        url: `${siteUrl}/${locale}${localizedPath}`,
        changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${siteUrl}/${l}${getLocalizedPath(path, l)}`])
          ),
        },
      };
    })
  );
}
