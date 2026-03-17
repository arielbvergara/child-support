/**
 * Sentry browser ingest origin for this project.
 *
 * Imported by both `middleware.ts` (where it is added to the per-request CSP
 * `connect-src` directive) and `next.config.ts` (referenced in comments).
 * Keeping it in one place prevents the two files from drifting apart.
 */
export const SENTRY_INGEST_ORIGIN = 'https://o4510704934846464.ingest.de.sentry.io';
