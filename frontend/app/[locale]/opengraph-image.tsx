import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TAGLINES: Record<string, string> = {
  nl: 'Groei begeleiden, één gezin tegelijk',
  en: 'Nurturing growth, one family at a time',
  de: 'Wachstum begleiten, eine Familie nach der anderen',
};

const SUBTITLES: Record<string, string> = {
  nl: 'Professionele pedagogische begeleiding',
  en: 'Professional pedagogical guidance',
  de: 'Professionelle pädagogische Begleitung',
};

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;

  const tagline = TAGLINES[locale] ?? TAGLINES.nl;
  const subtitle = SUBTITLES[locale] ?? SUBTITLES.nl;

  // Brand colours (from design tokens)
  const sagePrimary = '#2a9d8f';
  const warmBackground = '#f9faf8';
  const warmForeground = '#1e3a35';
  const coralAccent = '#f4845f';
  const warmMuted = '#628f8a';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: warmBackground,
          padding: '72px 80px',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            backgroundColor: sagePrimary,
          }}
        />

        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            right: '-60px',
            top: '-60px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            backgroundColor: sagePrimary,
            opacity: 0.08,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '40px',
            bottom: '40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: coralAccent,
            opacity: 0.1,
          }}
        />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
          {/* Site name */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: sagePrimary,
              letterSpacing: '-0.02em',
            }}
          >
            Pedagogisch Advies
          </div>

          {/* Main tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: '56px',
                fontWeight: 800,
                color: warmForeground,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                maxWidth: '900px',
              }}
            >
              {tagline}
            </div>
            <div
              style={{
                fontSize: '28px',
                color: warmMuted,
                fontWeight: 400,
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div
              style={{
                backgroundColor: sagePrimary,
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 600,
                padding: '12px 28px',
                borderRadius: '8px',
              }}
            >
              {locale === 'nl' ? 'Maak een afspraak' : locale === 'de' ? 'Termin vereinbaren' : 'Book a consultation'}
            </div>
            <div
              style={{
                fontSize: '18px',
                color: warmMuted,
              }}
            >
              ✓ {locale === 'nl' ? 'BIG-geregistreerd' : locale === 'de' ? 'BIG-registriert' : 'BIG-registered'}
              {'  ·  '}
              {locale === 'nl' ? '10+ jaar ervaring' : locale === 'de' ? '10+ Jahre Erfahrung' : '10+ years experience'}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
