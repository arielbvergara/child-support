import { SITE_CONFIG, PROFESSIONAL_INFO } from './constants';
import type { ProfessionalInfo } from './types';

interface BreadcrumbItem {
  name: string;
  path: string;
}


export function buildPersonSchema(
  locale: string,
  info: ProfessionalInfo = PROFESSIONAL_INFO,
) {
  const sameAsLinks = [info.linkedIn, info.bigRegister].filter(Boolean);

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
    ...(sameAsLinks.length > 0 ? { sameAs: sameAsLinks } : {}),
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

interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqPageSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
