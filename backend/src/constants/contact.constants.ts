export const CONTACT_OWNER_EMAIL = 'info@pedagogischadvies.nl';

export const CONTACT_VALIDATION = {
  NAME_MAX_LENGTH: 100,
  MESSAGE_MAX_LENGTH: 2000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const CONTACT_ROUTE_PATH = '/contact';

export const SHEETS_RANGE = 'A:F';
export const SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
export const SHEETS_COLUMNS = ['Timestamp', 'Name', 'Email', 'Phone', 'Service', 'Message'] as const;
export const GOOGLE_SHEETS_BASE_URL = 'https://docs.google.com/spreadsheets/d';
