import { describe, it, expect } from 'vitest';
import { buildPersonSchema } from '@/lib/seo';

const BASE_INFO = { name: 'Dr. Anna de Vries', photoUrl: '', linkedIn: '' };

describe('buildPersonSchema', () => {
  it('buildPersonSchema_Should_UseProvidedName_WhenInfoArgumentIsPassed', () => {
    const schema = buildPersonSchema('nl', { ...BASE_INFO, name: 'Dr. Anna de Vries' });
    expect(schema.name).toBe('Dr. Anna de Vries');
  });

  it('buildPersonSchema_Should_IncludeImage_WhenPhotoUrlIsNonEmpty', () => {
    const schema = buildPersonSchema('nl', {
      ...BASE_INFO,
      photoUrl: 'https://cdn.example.com/photo.jpg',
    }) as Record<string, unknown>;
    expect(schema.image).toBe('https://cdn.example.com/photo.jpg');
  });

  it('buildPersonSchema_Should_OmitImage_WhenPhotoUrlIsEmpty', () => {
    const schema = buildPersonSchema('nl', BASE_INFO) as Record<string, unknown>;
    expect(schema).not.toHaveProperty('image');
  });

  it('buildPersonSchema_Should_IncludeSameAs_WhenLinkedInIsNonEmpty', () => {
    const schema = buildPersonSchema('nl', {
      ...BASE_INFO,
      linkedIn: 'https://linkedin.com/in/anna-de-vries',
    }) as Record<string, unknown>;
    expect(schema.sameAs).toEqual(['https://linkedin.com/in/anna-de-vries']);
  });

  it('buildPersonSchema_Should_OmitSameAs_WhenLinkedInIsEmpty', () => {
    const schema = buildPersonSchema('nl', BASE_INFO) as Record<string, unknown>;
    expect(schema).not.toHaveProperty('sameAs');
  });

  it('buildPersonSchema_Should_IncludeCorrectUrl_WhenLocaleIsProvided', () => {
    const schema = buildPersonSchema('en', BASE_INFO);
    expect(schema.url).toContain('/en/about');
  });
});
