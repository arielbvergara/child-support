import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Skip initialisation when no DSN is configured (e.g. local development)
// to avoid SDK warnings and unnecessary overhead.
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    // Deliberately disabled: this app handles family and child data;
    // capturing PII (e.g. IP addresses) is avoided for privacy compliance.
    sendDefaultPii: false,
  });
}
