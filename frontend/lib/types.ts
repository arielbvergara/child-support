export interface NavLink {
  labelKey: string;
  href: string;
  hideDesktop?: boolean;
  hideMobile?: boolean;
  dropdown?: boolean;
}

export interface Service {
  id: string;
  slug: string;
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

export interface ProfessionalInfo {
  readonly name: string;
  readonly photoUrl: string;
  readonly linkedIn: string;
  readonly bigRegister: string;
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
