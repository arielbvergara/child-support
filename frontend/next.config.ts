import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
        // Content-Security-Policy is intentionally omitted here.
        // A per-request nonce-based CSP is set dynamically by middleware.ts,
        // which overrides any static value that would be set at this level.
        // Keeping it here as a static header would conflict with the nonce
        // because the nonce must be unique per request.
      ],
    },
  ],
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: 'arielbvergara',
  project: 'child-support-frontend',
  // Suppresses the Sentry build-time telemetry banner in CI logs.
  silent: !!process.env.CI,
  // Disable the Sentry webpack plugin's source map upload in development
  // to keep local builds fast; uploads only happen in CI/production.
  sourcemaps: {
    disable: process.env.NODE_ENV === 'development',
  },
});
