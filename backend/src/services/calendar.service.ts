import { createPrivateKey, createSign } from 'node:crypto';
import type { ValidatedAppointmentPayload, TimeSlot, CalendarEvent } from '../types/appointment.types';
import {
  CALENDAR_SCOPES,
  CALENDAR_API_BASE,
  GOOGLE_TOKEN_URL,
  SLOT_DURATION_MINUTES,
  WORKING_SCHEDULE,
  AVAILABILITY_CACHE_TTL_MS,
  BUSINESS_TIMEZONE,
} from '../constants/appointment.constants';

async function getAccessToken(serviceAccountEmail: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claimSet = Buffer.from(
    JSON.stringify({
      iss: serviceAccountEmail,
      scope: CALENDAR_SCOPES.join(' '),
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  ).toString('base64url');

  const signingInput = `${header}.${claimSet}`;
  const keyObject = createPrivateKey({ key: privateKeyPem, format: 'pem' });
  const signature = createSign('RSA-SHA256').update(signingInput).sign(keyObject).toString('base64url');
  const assertion = `${signingInput}.${signature}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google OAuth token exchange failed:', errorText);
    throw new Error('Authentication service unavailable');
  }

  const json = (await response.json()) as { access_token: string };
  return json.access_token;
}

/**
 * Returns the day of week (0 = Sunday … 6 = Saturday) for a given Date as it
 * appears in the specified IANA timezone. Uses numeric date parts to derive the
 * day, avoiding reliance on locale-specific weekday strings which vary across
 * Node.js ICU builds.
 */
function getDayOfWeekInTimezone(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)!.value, 10);
  return new Date(get('year'), get('month') - 1, get('day')).getDay();
}

/**
 * Creates a UTC Date representing a specific hour:minute on the calendar day
 * of `dateRef` as seen in the given IANA timezone. Uses a two-pass offset
 * correction to handle DST transition boundaries correctly.
 *
 * Example: createSlotInTimezone(mondayDate, 9, 0, 'Europe/Amsterdam')
 *   → returns a Date whose UTC value is 08:00 in winter (CET, UTC+1) or
 *     07:00 in summer (CEST, UTC+2), so it always represents 09:00 Amsterdam.
 */
export function createSlotInTimezone(
  dateRef: Date,
  hour: number,
  minute: number,
  timezone: string,
): Date {
  // Step 1: Get "YYYY-MM-DD" in the target timezone (en-CA locale gives ISO-date format)
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(dateRef);
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');

  // Step 2: Treat the target local time as UTC to get a rough approximation
  const approx = new Date(`${ymd}T${hh}:${mm}:00.000Z`);

  // Step 3: Determine what time the target timezone displays for that approximate UTC
  const formatParts = (d: Date) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).formatToParts(d);

  const get = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parseInt(parts.find((p) => p.type === type)!.value, 10);

  const approxParts = formatParts(approx);
  const tzMs = Date.UTC(
    get(approxParts, 'year'), get(approxParts, 'month') - 1, get(approxParts, 'day'),
    get(approxParts, 'hour'), get(approxParts, 'minute'), get(approxParts, 'second'),
  );

  // offsetMs: positive means timezone is behind UTC (e.g. UTC-1 → +3600000)
  const offsetMs = approx.getTime() - tzMs;
  const corrected = new Date(approx.getTime() + offsetMs);

  // Step 4: Verify the corrected time shows the expected hour:minute in the timezone.
  // If not (can happen at DST transitions), recalculate offset from the corrected time.
  const correctedParts = formatParts(corrected);
  if (get(correctedParts, 'hour') !== hour || get(correctedParts, 'minute') !== minute) {
    const corrTzMs = Date.UTC(
      get(correctedParts, 'year'), get(correctedParts, 'month') - 1, get(correctedParts, 'day'),
      get(correctedParts, 'hour'), get(correctedParts, 'minute'), get(correctedParts, 'second'),
    );
    const corrOffsetMs = corrected.getTime() - corrTzMs;
    return new Date(corrected.getTime() + (offsetMs - corrOffsetMs));
  }

  return corrected;
}

/**
 * Generates all candidate 60-minute slots within working hours for a given date,
 * using the business's IANA timezone so that 09:00 always means Amsterdam local
 * time regardless of the server runtime timezone.
 */
function generateSlotsForDate(date: Date): Date[] {
  const dayOfWeek = getDayOfWeekInTimezone(date, BUSINESS_TIMEZONE);
  const schedule = WORKING_SCHEDULE.find((s) => (s.days as readonly number[]).includes(dayOfWeek));
  if (!schedule) return [];

  const [startHour, startMin] = schedule.start.split(':').map(Number);
  const [endHour, endMin] = schedule.end.split(':').map(Number);

  const startTime = createSlotInTimezone(date, startHour, startMin, BUSINESS_TIMEZONE);
  const endTime = createSlotInTimezone(date, endHour, endMin, BUSINESS_TIMEZONE);

  const slots: Date[] = [];
  const cursor = new Date(startTime);

  while (cursor.getTime() + SLOT_DURATION_MINUTES * 60 * 1000 <= endTime.getTime()) {
    slots.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + SLOT_DURATION_MINUTES);
  }

  return slots;
}

/**
 * Returns true when a candidate slot overlaps with a calendar event.
 * A slot runs from `slotStart` to `slotStart + SLOT_DURATION_MINUTES`.
 */
function slotOverlapsEvent(slotStart: Date, event: CalendarEvent): boolean {
  const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);
  const eventStart = new Date(event.start.dateTime);
  const eventEnd = new Date(event.end.dateTime);

  // Overlap when slotStart < eventEnd AND slotEnd > eventStart
  return slotStart < eventEnd && slotEnd > eventStart;
}

type AvailabilityCache = {
  slots: TimeSlot[];
  expiresAt: number;
};

export function createCalendarService(
  serviceAccountEmail: string,
  privateKey: string,
  calendarId: string,
) {
  const normalizedKey = privateKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();

  let availabilityCache: AvailabilityCache | null = null;

  function invalidateCache(): void {
    availabilityCache = null;
  }

  async function getExistingEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
    const accessToken = await getAccessToken(serviceAccountEmail, normalizedKey);
    const encodedCalendarId = encodeURIComponent(calendarId);
    const params = new URLSearchParams({
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const url = `${CALENDAR_API_BASE}/calendars/${encodedCalendarId}/events?${params.toString()}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Calendar list events failed:', errorText);
      throw new Error('Failed to fetch calendar events');
    }

    const json = (await response.json()) as { items: CalendarEvent[] };
    // Filter to only events that have a dateTime (not all-day events without time)
    return (json.items ?? []).filter((e) => e.start?.dateTime && e.end?.dateTime);
  }

  async function getAvailableSlots(from: Date, to: Date): Promise<TimeSlot[]> {
    const now = new Date();

    // Return cached slots (filtered to exclude any that have since passed)
    if (availabilityCache && now.getTime() < availabilityCache.expiresAt) {
      return availabilityCache.slots.filter((s) => new Date(s.datetime) > now);
    }

    const existingEvents = await getExistingEvents(from, to);

    const slots: TimeSlot[] = [];
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= to) {
      const daySlots = generateSlotsForDate(cursor);

      for (const slot of daySlots) {
        // Exclude past slots
        if (slot <= now) continue;
        // Exclude slots that conflict with existing events
        const hasConflict = existingEvents.some((event) => slotOverlapsEvent(slot, event));
        if (!hasConflict) {
          slots.push({ datetime: slot.toISOString() });
        }
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    availabilityCache = { slots, expiresAt: now.getTime() + AVAILABILITY_CACHE_TTL_MS };

    return slots;
  }

  async function createCalendarEvent(payload: ValidatedAppointmentPayload): Promise<void> {
    const accessToken = await getAccessToken(serviceAccountEmail, normalizedKey);
    const encodedCalendarId = encodeURIComponent(calendarId);

    const start = new Date(payload.datetime);
    const end = new Date(start.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

    const descriptionParts = [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : null,
      payload.service ? `Service: ${payload.service}` : null,
      payload.notes ? `Notes: ${payload.notes}` : null,
    ].filter(Boolean);

    const event = {
      summary: `Appointment: ${payload.name}`,
      description: descriptionParts.join('\n'),
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    };

    const url = `${CALENDAR_API_BASE}/calendars/${encodedCalendarId}/events`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Calendar create event failed:', errorText);
      throw new Error('Failed to create calendar event');
    }

    // A new booking was created — invalidate cached availability so the next
    // visitor sees up-to-date slots without waiting for the TTL to expire.
    invalidateCache();
  }

  /**
   * Checks whether a specific datetime slot is still available (not taken by
   * any existing calendar event). Used as a last-check before confirming booking.
   */
  async function isSlotAvailable(datetime: string): Promise<boolean> {
    const slotStart = new Date(datetime);
    const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);
    const existingEvents = await getExistingEvents(slotStart, slotEnd);
    return !existingEvents.some((event) => slotOverlapsEvent(slotStart, event));
  }

  return { getAvailableSlots, createCalendarEvent, isSlotAvailable, invalidateCache };
}

export type CalendarService = ReturnType<typeof createCalendarService>;

/**
 * Generates all working-hour slots in a date range without any calendar
 * availability check. Used as a fallback when no calendar is configured.
 */
export function generateAllWorkingSlots(from: Date, to: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);

  const now = new Date();

  while (cursor <= to) {
    const daySlots = generateSlotsForDate(cursor);
    for (const slot of daySlots) {
      if (slot > now) {
        slots.push({ datetime: slot.toISOString() });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return slots;
}
