import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  // Deliberately disabled: this app handles family and child data;
  // capturing PII (e.g. IP addresses) is avoided for privacy compliance.
  sendDefaultPii: false,
});
