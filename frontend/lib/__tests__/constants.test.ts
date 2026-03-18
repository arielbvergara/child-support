import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('CONTACT_INFO', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('CONTACT_INFO_Should_UseEnvVar_WhenNEXT_PUBLIC_BUSINESS_PHONE_IsSet', async () => {
    vi.stubEnv('NEXT_PUBLIC_BUSINESS_PHONE', '+31 20 999 8888');
    const { CONTACT_INFO } = await import('../constants');
    expect(CONTACT_INFO.phone).toBe('+31 20 999 8888');
  });

  it('CONTACT_INFO_Should_UseEnvVar_WhenNEXT_PUBLIC_BUSINESS_EMAIL_IsSet', async () => {
    vi.stubEnv('NEXT_PUBLIC_BUSINESS_EMAIL', 'real@business.nl');
    const { CONTACT_INFO } = await import('../constants');
    expect(CONTACT_INFO.email).toBe('real@business.nl');
  });

  it('CONTACT_INFO_Should_UseEnvVar_WhenNEXT_PUBLIC_BUSINESS_ADDRESS_LINE_1_IsSet', async () => {
    vi.stubEnv('NEXT_PUBLIC_BUSINESS_ADDRESS_LINE_1', 'Keizersgracht 123');
    const { CONTACT_INFO } = await import('../constants');
    expect(CONTACT_INFO.addressLine1).toBe('Keizersgracht 123');
  });

  it('CONTACT_INFO_Should_UseEnvVar_WhenNEXT_PUBLIC_BUSINESS_POSTAL_CODE_IsSet', async () => {
    vi.stubEnv('NEXT_PUBLIC_BUSINESS_POSTAL_CODE', '1015 CJ');
    const { CONTACT_INFO } = await import('../constants');
    expect(CONTACT_INFO.postalCode).toBe('1015 CJ');
  });

  it('CONTACT_INFO_Should_UseEnvVar_WhenNEXT_PUBLIC_BUSINESS_CITY_IsSet', async () => {
    vi.stubEnv('NEXT_PUBLIC_BUSINESS_CITY', 'Amsterdam');
    const { CONTACT_INFO } = await import('../constants');
    expect(CONTACT_INFO.city).toBe('Amsterdam');
  });

  it('CONTACT_INFO_Should_FallbackToEmptyString_WhenEnvVarsAreAbsent', async () => {
    const { CONTACT_INFO } = await import('../constants');
    expect(CONTACT_INFO.phone).toBe('');
    expect(CONTACT_INFO.email).toBe('');
    expect(CONTACT_INFO.addressLine1).toBe('');
    expect(CONTACT_INFO.postalCode).toBe('');
    expect(CONTACT_INFO.city).toBe('');
  });
});

describe('PROFESSIONAL_INFO', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('PROFESSIONAL_INFO_Should_UseEnvVar_WhenNEXT_PUBLIC_PROFESSIONAL_NAME_IsSet', async () => {
    vi.stubEnv('NEXT_PUBLIC_PROFESSIONAL_NAME', 'Dr. Anna de Vries');
    const { PROFESSIONAL_INFO } = await import('../constants');
    expect(PROFESSIONAL_INFO.name).toBe('Dr. Anna de Vries');
  });

  it('PROFESSIONAL_INFO_Should_ReturnEmptyString_WhenEnvVarIsAbsent', async () => {
    const { PROFESSIONAL_INFO } = await import('../constants');
    expect(PROFESSIONAL_INFO.name).toBe('');
  });

  it('PROFESSIONAL_INFO_Should_UseEnvVar_WhenNEXT_PUBLIC_PROFESSIONAL_PHOTO_URL_IsSet', async () => {
    vi.stubEnv('NEXT_PUBLIC_PROFESSIONAL_PHOTO_URL', 'https://cdn.example.com/photo.jpg');
    const { PROFESSIONAL_INFO } = await import('../constants');
    expect(PROFESSIONAL_INFO.photoUrl).toBe('https://cdn.example.com/photo.jpg');
  });

  it('PROFESSIONAL_INFO_Should_HaveEmptyPhotoUrl_WhenEnvVarIsAbsent', async () => {
    const { PROFESSIONAL_INFO } = await import('../constants');
    expect(PROFESSIONAL_INFO.photoUrl).toBe('');
  });

  it('PROFESSIONAL_INFO_Should_UseEnvVar_WhenNEXT_PUBLIC_PROFESSIONAL_LINKEDIN_IsSet', async () => {
    vi.stubEnv('NEXT_PUBLIC_PROFESSIONAL_LINKEDIN', 'https://linkedin.com/in/anna-de-vries');
    const { PROFESSIONAL_INFO } = await import('../constants');
    expect(PROFESSIONAL_INFO.linkedIn).toBe('https://linkedin.com/in/anna-de-vries');
  });

  it('PROFESSIONAL_INFO_Should_HaveEmptyLinkedIn_WhenEnvVarIsAbsent', async () => {
    const { PROFESSIONAL_INFO } = await import('../constants');
    expect(PROFESSIONAL_INFO.linkedIn).toBe('');
  });

  it('PROFESSIONAL_INFO_Should_UseEnvVar_WhenNEXT_PUBLIC_PROFESSIONAL_BIG_REGISTER_IsSet', async () => {
    vi.stubEnv('NEXT_PUBLIC_PROFESSIONAL_BIG_REGISTER', 'https://www.bigregister.nl/zorgverlener/123456789');
    const { PROFESSIONAL_INFO } = await import('../constants');
    expect(PROFESSIONAL_INFO.bigRegister).toBe('https://www.bigregister.nl/zorgverlener/123456789');
  });

  it('PROFESSIONAL_INFO_Should_HaveEmptyBigRegister_WhenEnvVarIsAbsent', async () => {
    const { PROFESSIONAL_INFO } = await import('../constants');
    expect(PROFESSIONAL_INFO.bigRegister).toBe('');
  });
});
