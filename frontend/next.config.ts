import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isDev = process.env.NODE_ENV === 'development';

// Include the backend API origin in connect-src so cross-origin fetch requests
// to NEXT_PUBLIC_API_URL are not blocked by CSP.
const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? '';

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
        {
          // next-intl and Next.js require unsafe-inline for styles and scripts.
          // unsafe-eval is only needed in development (e.g. hot-reload eval); it is
          // intentionally excluded from production to maintain a stronger CSP.
          // frame-ancestors 'none' replaces X-Frame-Options for modern browsers.
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "font-src 'self'",
            `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ''}`,
            "frame-ancestors 'none'",
          ].join('; '),
        },
      ],
    },
  ],
};

export default withNextIntl(nextConfig);
