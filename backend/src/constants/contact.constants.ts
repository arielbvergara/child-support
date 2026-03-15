export const CONTACT_OWNER_EMAIL = 'info@pedagogischadvies.nl';

export const CONTACT_VALIDATION = {
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 254,
  PHONE_MAX_LENGTH: 20,
  SERVICE_MAX_LENGTH: 100,
  MESSAGE_MAX_LENGTH: 2000,
  // Simple heuristic email check: requires a TLD with at least 2 alphabetic characters (not fully RFC-compliant)
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const CONTACT_ROUTE_PATH = '/contact';

export const CONTACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const CONTACT_RATE_LIMIT_MAX = 5; // max 5 submissions per window per IP

export const SHEETS_RANGE = 'A:F';
export const SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
export const SHEETS_COLUMNS = ['Timestamp', 'Name', 'Email', 'Phone', 'Service', 'Message'] as const;
export const GOOGLE_SHEETS_BASE_URL = 'https://docs.google.com/spreadsheets/d';
