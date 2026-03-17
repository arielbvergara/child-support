import { SITE_CONFIG, PROFESSIONAL_INFO } from './constants';

interface BreadcrumbItem {
  name: string;
  path: string;
}

type ProfessionalInfo = { name: string; photoUrl: string; linkedIn: string };

export function buildPersonSchema(
  locale: string,
  info: ProfessionalInfo = PROFESSIONAL_INFO,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_CONFIG.siteUrl}/#person`,
    name: info.name,
    jobTitle: 'Pedagoog / Pedagogisch Adviseur',
    description:
      'Met meer dan tien jaar ervaring in de pedagogische begeleiding help ik kinderen en gezinnen bij hun ontwikkeling.',
    url: `${SITE_CONFIG.siteUrl}/${locale}/about`,
    ...(info.photoUrl ? { image: info.photoUrl } : {}),
    worksFor: {
      '@id': `${SITE_CONFIG.siteUrl}/#business`,
    },
    ...(info.linkedIn ? { sameAs: [info.linkedIn] } : {}),
    knowsLanguage: ['nl', 'en', 'de'],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'degree',
        name: 'Master Pedagogische Wetenschappen (M.Ed.)',
        recognizedBy: {
          '@type': 'Organization',
          name: 'Universiteit van Amsterdam',
        },
        dateCreated: '2012',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'certificate',
        name: 'Postdoctoraal certificaat Gezinstherapie',
        dateCreated: '2015',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'certificate',
        name: 'Opleiding Ontwikkelingspsychologie Kinderen',
        dateCreated: '2018',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'license',
        name: 'NIP-geregistreerd pedagoog',
        dateCreated: '2020',
      },
    ],
  };
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
