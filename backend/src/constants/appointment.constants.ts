export const APPOINTMENT_ROUTE_PATH = '/appointments';

export const APPOINTMENT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const APPOINTMENT_RATE_LIMIT_MAX = 3; // max 3 bookings per window per IP

export const SLOT_DURATION_MINUTES = 60;
export const BOOKING_WINDOW_MONTHS = 2;

/**
 * Working schedule used to generate candidate appointment slots.
 * dayOfWeek follows JS Date convention: 0 = Sunday, 1 = Monday, … 6 = Saturday.
 */
export const WORKING_SCHEDULE = [
  { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' }, // Monday – Friday
  { days: [6], start: '10:00', end: '14:00' },              // Saturday
] as const;

export const APPOINTMENT_VALIDATION = {
  NOTES_MAX_LENGTH: 500,
} as const;

/**
 * IANA timezone for the business. Used to interpret working-hour boundaries
 * and format appointment datetimes in emails — ensures correct local times
 * regardless of the server runtime timezone (which is UTC on Vercel).
 */
export const BUSINESS_TIMEZONE = 'Europe/Amsterdam';

export const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar'] as const;
export const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

/**
 * How long the availability slot list is cached server-side before the next
 * Google Calendar API call is made. Keeps us well within API rate limits while
 * still reflecting manual calendar changes within a reasonable window.
 */
export const AVAILABILITY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
