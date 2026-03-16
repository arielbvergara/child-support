import type { Service, NavLink, Testimonial, ContactInfo, Credential } from './types';

export const SITE_CONFIG = {
  name: 'Pedagogisch Advies',
  defaultLocale: 'nl',
  locales: ['nl', 'en', 'de'] as const,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com',
} as const;

export const NAV_LINKS: NavLink[] = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'nav.services', href: '/#services' },
  { labelKey: 'nav.about', href: '/about' },
  { labelKey: 'nav.contact', href: '/contact', hideDesktop: true },
  { labelKey: 'nav.bookConsultation', href: '/make-an-appointment', hideMobile: true },
];

/**
 * Working schedule mirrored from the backend for display and slot validation purposes.
 * dayOfWeek follows JS Date convention: 0 = Sunday, 1 = Monday, … 6 = Saturday.
 */
export const SCHEDULE_CONFIG = {
  SLOT_DURATION_MINUTES: 60,
  BOOKING_WINDOW_MONTHS: 2,
  WORKING_SCHEDULE: [
    { days: [1, 2, 3, 4, 5] as number[], start: '09:00', end: '17:00' },
    { days: [6] as number[], start: '10:00', end: '14:00' },
  ],
} as const;

export const SERVICES: Service[] = [
  {
    id: 'individual',
    icon: 'Users',
    titleKey: 'services.individual.title',
    descriptionKey: 'services.individual.description',
    online: true,
    inPerson: true,
  },
  {
    id: 'workshops',
    icon: 'BookOpen',
    titleKey: 'services.workshops.title',
    descriptionKey: 'services.workshops.description',
    online: true,
    inPerson: true,
  },
  {
    id: 'assessment',
    icon: 'ClipboardList',
    titleKey: 'services.assessment.title',
    descriptionKey: 'services.assessment.description',
    online: false,
    inPerson: true,
  },
  {
    id: 'school',
    icon: 'School',
    titleKey: 'services.school.title',
    descriptionKey: 'services.school.description',
    online: true,
    inPerson: true,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quoteKey: 'testimonials.1.quote',
    authorKey: 'testimonials.1.author',
    roleKey: 'testimonials.1.role',
  },
  {
    id: '2',
    quoteKey: 'testimonials.2.quote',
    authorKey: 'testimonials.2.author',
    roleKey: 'testimonials.2.role',
  },
];

export const TRUST_STATS = [
  { valueKey: 'trust.years.value', labelKey: 'trust.years.label' },
  { valueKey: 'trust.families.value', labelKey: 'trust.families.label' },
  { valueKey: 'trust.certified.value', labelKey: 'trust.certified.label' },
];

export const CONTACT_INFO: ContactInfo = {
  addressLine1: 'Voorbeeldstraat 1',
  addressLine2: '1234 AB Amsterdam',
  phone: '+31 20 123 4567',
  email: 'info@pedagogischadvies.nl',
  hours: [
    { dayKey: 'contact.hours.weekdays', time: '09:00 – 17:00' },
    { dayKey: 'contact.hours.saturday', time: '10:00 – 14:00' },
    { dayKey: 'contact.hours.sunday', time: '—' },
  ],
};

export const CREDENTIALS: Credential[] = [
  { titleKey: 'about.credentials.1', year: '2012', institution: 'Universiteit van Amsterdam' },
  { titleKey: 'about.credentials.2', year: '2015' },
  { titleKey: 'about.credentials.3', year: '2018' },
  { titleKey: 'about.credentials.4', year: '2020' },
];

export const PHILOSOPHY_PILLARS = [
  { icon: 'Heart', titleKey: 'about.philosophy.pillar1.title', descKey: 'about.philosophy.pillar1.description' },
  { icon: 'Home', titleKey: 'about.philosophy.pillar2.title', descKey: 'about.philosophy.pillar2.description' },
  { icon: 'Microscope', titleKey: 'about.philosophy.pillar3.title', descKey: 'about.philosophy.pillar3.description' },
];
