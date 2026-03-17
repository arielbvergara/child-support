export interface NavLink {
  labelKey: string;
  href: string;
  hideDesktop?: boolean;
  hideMobile?: boolean;
  dropdown?: boolean;
}

export interface ServicePageConfig {
  id: string;
  slug: string;
  icon: string;
  online: boolean;
  inPerson: boolean;
}

export interface Service {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  online: boolean;
  inPerson: boolean;
}

export interface Testimonial {
  id: string;
  quoteKey: string;
  authorKey: string;
  roleKey: string;
}

export interface ContactInfo {
  addressLine1: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  hours: { dayKey: string; time: string }[];
}

export interface Credential {
  titleKey: string;
  year?: string;
  institution?: string;
}

export type Locale = 'nl' | 'en' | 'de';
