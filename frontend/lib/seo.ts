import { SITE_CONFIG } from './constants';

interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbSchema(locale: string, items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.siteUrl}/${locale}${item.path}`,
    })),
  };
}
