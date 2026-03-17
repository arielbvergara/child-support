import type { MetadataRoute } from 'next';
import { SERVICE_PAGES, SITE_CONFIG } from '@/lib/constants';

const serviceEntries = SERVICE_PAGES.map((service) => ({
  path: `/services/${service.slug}`,
  priority: 0.9,
  changeFrequency: 'monthly' as const,
}));

const INDEXABLE_PAGES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/make-an-appointment', priority: 0.7, changeFrequency: 'monthly' as const },
  ...serviceEntries,
];

export default function sitemap(): MetadataRoute.Sitemap {
  const { locales, siteUrl } = SITE_CONFIG;

  return INDEXABLE_PAGES.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteUrl}/${l}${path}`])
        ),
      },
    }))
  );
}
