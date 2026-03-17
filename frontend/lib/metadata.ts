import type { Metadata } from 'next';
import { SITE_CONFIG } from './constants';
import type { Locale } from './types';

const PAGE_TITLES: Record<string, Record<Locale, string>> = {
  home: {
    nl: 'Kind- en Gezinsbegeleiding',
    en: 'Child & Family Development Support',
    de: 'Kinder- und Familienbegleitung',
  },
  about: {
    nl: 'Over mij — Pedagoog',
    en: 'About Me — Pedagogy Professional',
    de: 'Über mich — Pädagogin',
  },
  contact: {
    nl: 'Contact — Maak een Afspraak',
    en: 'Contact — Book a Consultation',
    de: 'Kontakt — Termin vereinbaren',
  },
  privacy: {
    nl: 'Privacybeleid',
    en: 'Privacy Policy',
    de: 'Datenschutzrichtlinie',
  },
  terms: {
    nl: 'Algemene Voorwaarden',
    en: 'Terms of Service',
    de: 'Nutzungsbedingungen',
  },
  appointment: {
    nl: 'Maak een afspraak — Pedagoog',
    en: 'Make an Appointment — Pedagogy Professional',
    de: 'Termin vereinbaren — Pädagogin',
  },
};

const PAGE_DESCRIPTIONS: Record<string, Record<Locale, string>> = {
  home: {
    nl: 'Professionele pedagogische begeleiding voor kinderen en gezinnen. Individuele consulten, groepsworkshops, kindbeoordelingen en ondersteuning voor scholen.',
    en: 'Professional pedagogical guidance for children and families. Individual consultations, group workshops, child assessments, and school support.',
    de: 'Professionelle pädagogische Begleitung für Kinder und Familien. Einzelberatungen, Gruppenworkshops, Kinderbeurteilungen und Schulunterstützung.',
  },
  about: {
    nl: 'Meer over mijn achtergrond, kwalificaties en kind-gerichte aanpak bij de begeleiding van gezinnen.',
    en: 'Learn about my background, qualifications, and child-centered approach to family development support.',
    de: 'Erfahren Sie mehr über meinen Hintergrund, meine Qualifikationen und meinen kindzentrierten Ansatz.',
  },
  contact: {
    nl: 'Neem contact op voor een vrijblijvend gesprek. Bereikbaar voor online en persoonlijke afspraken.',
    en: 'Get in touch to discuss how I can support your family. Available for online and in-person appointments.',
    de: 'Nehmen Sie Kontakt auf, um zu besprechen, wie ich Ihre Familie unterstützen kann.',
  },
  privacy: {
    nl: 'Lees ons privacybeleid voor informatie over hoe wij omgaan met uw persoonsgegevens.',
    en: 'Read our privacy policy to understand how we collect and protect your personal information.',
    de: 'Lesen Sie unsere Datenschutzrichtlinie, um zu verstehen, wie wir Ihre Daten verarbeiten.',
  },
  terms: {
    nl: 'Lees onze algemene voorwaarden voor het gebruik van onze diensten.',
    en: 'Read the terms and conditions for using our child development support services.',
    de: 'Lesen Sie die Nutzungsbedingungen für unsere pädagogischen Beratungsleistungen.',
  },
  appointment: {
    nl: 'Maak eenvoudig een afspraak online. Kies een datum en tijdstip dat u uitkomt.',
    en: 'Book a consultation online. Choose a date and time that works for you.',
    de: 'Buchen Sie online eine Beratung. Wählen Sie ein Datum und eine Uhrzeit.',
  },
};

export function createMetadata(
  pageKey: keyof typeof PAGE_TITLES,
  locale: Locale,
  overrides: Partial<Metadata> = {}
): Metadata {
  const title = PAGE_TITLES[pageKey]?.[locale] ?? PAGE_TITLES[pageKey]?.nl;
  const description =
    PAGE_DESCRIPTIONS[pageKey]?.[locale] ?? PAGE_DESCRIPTIONS[pageKey]?.nl;

  const alternateLocales = SITE_CONFIG.locales.filter((l) => l !== locale);
  const localeNames: Record<Locale, string> = {
    nl: 'nl_NL',
    en: 'en_GB',
    de: 'de_DE',
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: localeNames[locale],
      alternateLocale: alternateLocales.map((l) => localeNames[l]),
    },
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        SITE_CONFIG.locales.map((l) => [l, `/${l}`])
      ),
    },
    ...overrides,
  };
}
