import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  // Deliberately disabled: this app handles family and child data;
  // capturing PII (e.g. IP addresses) is avoided for privacy compliance.
  sendDefaultPii: false,
});
