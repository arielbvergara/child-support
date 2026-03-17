import { createCalendarService, generateAllWorkingSlots, createSlotInTimezone } from '../../src/services/calendar.service';
import { SLOT_DURATION_MINUTES, BUSINESS_TIMEZONE } from '../../src/constants/appointment.constants';
import type { ValidatedAppointmentPayload } from '../../src/types/appointment.types';

jest.mock('node:crypto', () => {
  const actual = jest.requireActual<typeof import('node:crypto')>('node:crypto');
  return {
    ...actual,
    createPrivateKey: jest.fn().mockReturnValue({}),
    createSign: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      sign: jest.fn().mockReturnValue(Buffer.from('mock-signature')),
    }),
  };
});

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockTokenSuccess() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ access_token: 'mock-access-token' }),
  });
}

function mockCalendarEventsSuccess(events: object[]) {
  mockTokenSuccess();
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ items: events }),
  });
}

function mockCalendarCreateSuccess() {
  mockTokenSuccess();
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ id: 'mock-event-id' }),
  });
}

/** Returns the next Monday at a given hour (local time) */
function nextMonday(hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  d.setHours(hour, 0, 0, 0);
  return d;
}

/** Returns end-of-day (23:59:59.999) for the given date */
function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Returns next Sunday at midnight */
function nextSunday(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns next Saturday at midnight */
function nextSaturday(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

describe('createCalendarService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('getAvailableSlots', () => {
    it('getAvailableSlots_ShouldReturnSlots_WhenCalendarIsEmpty', async () => {
      const from = nextMonday(0);
      from.setHours(0, 0, 0, 0);
      const to = endOfDay(from);

      mockCalendarEventsSuccess([]);

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      const slots = await service.getAvailableSlots(from, to);

      // Monday 09:00–17:00 yields 8 slots of 60 min
      expect(slots.length).toBe(8);
    });

    it('getAvailableSlots_ShouldExcludeSlots_WhenEventConflictsExist', async () => {
      const monday = nextMonday(0);
      monday.setHours(0, 0, 0, 0);
      const to = endOfDay(monday);

      // Block the 09:00 slot
      const eventStart = new Date(monday);
      eventStart.setHours(9, 0, 0, 0);
      const eventEnd = new Date(eventStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

      mockCalendarEventsSuccess([
        { start: { dateTime: eventStart.toISOString() }, end: { dateTime: eventEnd.toISOString() } },
      ]);

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      const slots = await service.getAvailableSlots(monday, to);

      expect(slots.length).toBe(7); // 8 total − 1 blocked
      expect(slots.some((s) => new Date(s.datetime).getHours() === 9)).toBe(false);
    });

    it('getAvailableSlots_ShouldExcludeSlots_WhenEventPartiallyOverlaps', async () => {
      const monday = nextMonday(0);
      monday.setHours(0, 0, 0, 0);
      const to = endOfDay(monday);

      // An event starting at 09:30 overlaps with both the 09:00 and 10:00 slots
      const eventStart = new Date(monday);
      eventStart.setHours(9, 30, 0, 0);
      const eventEnd = new Date(monday);
      eventEnd.setHours(10, 30, 0, 0);

      mockCalendarEventsSuccess([
        { start: { dateTime: eventStart.toISOString() }, end: { dateTime: eventEnd.toISOString() } },
      ]);

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      const slots = await service.getAvailableSlots(monday, to);

      // 09:00 and 10:00 are blocked; 8 - 2 = 6 remain
      expect(slots.length).toBe(6);
    });

    it('getAvailableSlots_ShouldReturnNoSlots_WhenDayIsSunday', async () => {
      const sunday = nextSunday();
      const to = endOfDay(sunday);

      mockCalendarEventsSuccess([]);

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      const slots = await service.getAvailableSlots(sunday, to);

      expect(slots.length).toBe(0);
    });

    it('getAvailableSlots_ShouldThrow_WhenCalendarApiReturnsError', async () => {
      mockTokenSuccess();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Forbidden',
      });

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      const from = nextMonday(0);
      const to = endOfDay(from);

      await expect(service.getAvailableSlots(from, to)).rejects.toThrow('Failed to fetch calendar events');
    });
  });

  describe('createCalendarEvent', () => {
    const validPayload: ValidatedAppointmentPayload = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+31 20 123 4567',
      service: 'individual',
      notes: 'Looking forward to the session',
      datetime: nextMonday(10).toISOString(),
    };

    it('createCalendarEvent_ShouldCallCalendarApiOnce_WhenPayloadIsValid', async () => {
      mockCalendarCreateSuccess();

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      await service.createCalendarEvent(validPayload);

      // fetch called twice: token + create event
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('createCalendarEvent_ShouldSetCorrectEndTime_WhenPayloadIsValid', async () => {
      mockCalendarCreateSuccess();

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      await service.createCalendarEvent(validPayload);

      const createCall = mockFetch.mock.calls[1];
      const body = JSON.parse(createCall[1].body as string) as {
        start: { dateTime: string };
        end: { dateTime: string };
      };

      const start = new Date(body.start.dateTime);
      const end = new Date(body.end.dateTime);
      const diffMinutes = (end.getTime() - start.getTime()) / 60000;

      expect(diffMinutes).toBe(SLOT_DURATION_MINUTES);
    });

    it('createCalendarEvent_ShouldIncludeNameInSummary_WhenPayloadIsValid', async () => {
      mockCalendarCreateSuccess();

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      await service.createCalendarEvent(validPayload);

      const createCall = mockFetch.mock.calls[1];
      const body = JSON.parse(createCall[1].body as string) as { summary: string };

      expect(body.summary).toContain(validPayload.name);
    });

    it('createCalendarEvent_ShouldThrow_WhenCalendarApiReturnsError', async () => {
      mockTokenSuccess();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Internal Server Error',
      });

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      await expect(service.createCalendarEvent(validPayload)).rejects.toThrow('Failed to create calendar event');
    });
  });

  describe('availability cache', () => {
    it('getAvailableSlots_ShouldUseCachedSlots_WhenCalledTwiceWithinTtl', async () => {
      const monday = nextMonday(0);
      monday.setHours(0, 0, 0, 0);
      const to = endOfDay(monday);

      // Only queue one round of fetch mocks — second call must NOT hit the network
      mockCalendarEventsSuccess([]);

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      const first = await service.getAvailableSlots(monday, to);
      const second = await service.getAvailableSlots(monday, to);

      // fetch called exactly twice (token + events) for the first call only
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(second.length).toBe(first.length);
    });

    it('getAvailableSlots_ShouldRefetchFromApi_WhenCacheIsInvalidated', async () => {
      const monday = nextMonday(0);
      monday.setHours(0, 0, 0, 0);
      const to = endOfDay(monday);

      // Two full rounds of mocks: initial fetch + post-invalidation fetch
      mockCalendarEventsSuccess([]);
      mockCalendarEventsSuccess([]);

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      await service.getAvailableSlots(monday, to);

      service.invalidateCache();

      await service.getAvailableSlots(monday, to);

      // fetch called four times: (token + events) × 2
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('createCalendarEvent_ShouldInvalidateCache_WhenEventIsCreated', async () => {
      const monday = nextMonday(0);
      monday.setHours(0, 0, 0, 0);
      const to = endOfDay(monday);

      const payload: ValidatedAppointmentPayload = {
        name: 'Cache Test',
        email: 'cache@example.com',
        phone: '',
        service: '',
        notes: '',
        datetime: nextMonday(10).toISOString(),
      };

      // Round 1: populate cache
      mockCalendarEventsSuccess([]);
      // Round 2: create event (invalidates cache)
      mockCalendarCreateSuccess();
      // Round 3: re-fetch after invalidation
      mockCalendarEventsSuccess([]);

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      await service.getAvailableSlots(monday, to);   // fills cache
      await service.createCalendarEvent(payload);    // invalidates cache
      await service.getAvailableSlots(monday, to);   // must hit API again

      // 6 fetch calls total: (token+events) + (token+create) + (token+events)
      expect(mockFetch).toHaveBeenCalledTimes(6);
    });
  });

  describe('isSlotAvailable', () => {
    it('isSlotAvailable_ShouldReturnTrue_WhenNoConflictingEvents', async () => {
      mockCalendarEventsSuccess([]);

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      const result = await service.isSlotAvailable(nextMonday(10).toISOString());

      expect(result).toBe(true);
    });

    it('isSlotAvailable_ShouldReturnFalse_WhenSlotIsConflicting', async () => {
      const slotStart = nextMonday(10);
      const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

      mockCalendarEventsSuccess([
        { start: { dateTime: slotStart.toISOString() }, end: { dateTime: slotEnd.toISOString() } },
      ]);

      const service = createCalendarService('sa@test.iam.gserviceaccount.com', 'key', 'primary');
      const result = await service.isSlotAvailable(slotStart.toISOString());

      expect(result).toBe(false);
    });
  });
});

describe('createSlotInTimezone', () => {
  it('createSlotInTimezone_ShouldReturnCorrectUtcTime_WhenTimezoneIsAmsterdamWinter', () => {
    // March 17 2026 is in CET (UTC+1). 09:00 Amsterdam = 08:00 UTC.
    const date = new Date('2026-03-17T00:00:00.000Z'); // midnight UTC = 01:00 Amsterdam (same day)
    const slot = createSlotInTimezone(date, 9, 0, BUSINESS_TIMEZONE);

    expect(slot.getUTCHours()).toBe(8);
    expect(slot.getUTCMinutes()).toBe(0);
    expect(slot.getUTCFullYear()).toBe(2026);
    expect(slot.getUTCMonth()).toBe(2); // March (0-indexed)
    expect(slot.getUTCDate()).toBe(17);
  });

  it('createSlotInTimezone_ShouldReturnCorrectUtcTime_WhenTimezoneIsAmsterdamSummer', () => {
    // July 14 2026 is in CEST (UTC+2). 09:00 Amsterdam = 07:00 UTC.
    const date = new Date('2026-07-14T00:00:00.000Z');
    const slot = createSlotInTimezone(date, 9, 0, BUSINESS_TIMEZONE);

    expect(slot.getUTCHours()).toBe(7);
    expect(slot.getUTCMinutes()).toBe(0);
    expect(slot.getUTCDate()).toBe(14);
  });
});

describe('generateAllWorkingSlots', () => {
  it('generateAllWorkingSlots_ShouldReturnSlots_WhenRangeIncludesWeekday', () => {
    const monday = nextMonday(0);
    monday.setHours(0, 0, 0, 0);

    const slots = generateAllWorkingSlots(monday, endOfDay(monday));

    expect(slots.length).toBe(8); // 09:00–17:00 = 8 × 60-min slots
  });

  it('generateAllWorkingSlots_ShouldReturnNoSlots_WhenRangeIsSundayOnly', () => {
    const sunday = nextSunday();

    const slots = generateAllWorkingSlots(sunday, endOfDay(sunday));

    expect(slots.length).toBe(0);
  });

  it('generateAllWorkingSlots_ShouldReturnSaturdaySlots_WhenRangeIncludesSaturday', () => {
    const saturday = nextSaturday();

    const slots = generateAllWorkingSlots(saturday, endOfDay(saturday));

    // Saturday 10:00–14:00 = 4 × 60-min slots
    expect(slots.length).toBe(4);
  });
});
