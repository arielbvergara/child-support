import request from 'supertest';
import { Resend } from 'resend';
import app from '../../src/app';
import { APPOINTMENT_VALIDATION, BOOKING_WINDOW_MONTHS, BUSINESS_TIMEZONE } from '../../src/constants/appointment.constants';
import { createSlotInTimezone } from '../../src/services/calendar.service';
import { CONTACT_VALIDATION } from '../../src/constants/contact.constants';

jest.mock('resend');
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

const mockSend = jest.fn();
(Resend as jest.MockedClass<typeof Resend>).mockImplementation(
  () => ({ emails: { send: mockSend } }) as unknown as Resend,
);

/** Returns next Monday at the given UTC hour */
function nextMonday(hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  d.setHours(hour, 0, 0, 0);
  return d;
}

/**
 * Returns next Monday at 08:00 UTC, which equals 09:00 Amsterdam CET (UTC+1).
 * This is the earliest valid working slot for a weekday.
 */
function nextMondayValidSlot(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  d.setUTCHours(8, 0, 0, 0); // 09:00 Amsterdam in winter (CET = UTC+1)
  return d;
}

const validBody = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+31 20 123 4567',
  service: 'individual',
  notes: 'Looking forward to the session',
  datetime: nextMonday(10).toISOString(),
};

describe('GET /appointments/availability', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockSend.mockReset();
    mockSend.mockResolvedValue({ id: 'mock-id' });
  });

  it('getAvailability_ShouldReturn200WithSlots_WhenCalendarIsNotConfigured', async () => {
    const res = await request(app).get('/appointments/availability');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('slots');
    expect(Array.isArray(res.body.slots)).toBe(true);
    expect(res.body.slots.length).toBeGreaterThan(0);
  });

  it('getAvailability_ShouldReturnOnlyFutureSlots_WhenCalendarIsNotConfigured', async () => {
    const res = await request(app).get('/appointments/availability');
    const now = new Date();

    for (const slot of res.body.slots as Array<{ datetime: string }>) {
      expect(new Date(slot.datetime) > now).toBe(true);
    }
  });

  it('getAvailability_ShouldReturnSlotsWithinBookingWindow_WhenCalendarIsNotConfigured', async () => {
    const res = await request(app).get('/appointments/availability');
    // Use end-of-day two months from now: slots on the last eligible day are still valid
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    twoMonthsFromNow.setHours(23, 59, 59, 999);

    for (const slot of res.body.slots as Array<{ datetime: string }>) {
      expect(new Date(slot.datetime) <= twoMonthsFromNow).toBe(true);
    }
  });
});

describe('POST /appointments', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockSend.mockReset();
    mockSend.mockResolvedValue({ id: 'mock-id' });
  });

  it('createAppointment_ShouldReturn200_WhenPayloadIsValid', async () => {
    const res = await request(app).post('/appointments').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('createAppointment_ShouldReturn200_WhenOptionalFieldsAreOmitted', async () => {
    const { phone: _p, service: _s, notes: _n, ...minimal } = validBody;
    const res = await request(app).post('/appointments').send(minimal);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('createAppointment_ShouldReturn422_WhenNameIsMissing', async () => {
    const { name: _n, ...body } = validBody;
    const res = await request(app).post('/appointments').send(body);

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'name' }));
  });

  it('createAppointment_ShouldReturn422_WhenEmailIsMissing', async () => {
    const { email: _e, ...body } = validBody;
    const res = await request(app).post('/appointments').send(body);

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'email' }));
  });

  it('createAppointment_ShouldReturn422_WhenEmailIsInvalidFormat', async () => {
    const res = await request(app)
      .post('/appointments')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'email' }));
  });

  it('createAppointment_ShouldReturn422_WhenDatetimeIsMissing', async () => {
    const { datetime: _d, ...body } = validBody;
    const res = await request(app).post('/appointments').send(body);

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'datetime' }));
  });

  it('createAppointment_ShouldReturn422_WhenDatetimeIsInPast', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const res = await request(app)
      .post('/appointments')
      .send({ ...validBody, datetime: pastDate.toISOString() });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'datetime' }));
  });

  it('createAppointment_ShouldReturn422_WhenDatetimeIsInvalid', async () => {
    const res = await request(app)
      .post('/appointments')
      .send({ ...validBody, datetime: 'not-a-date' });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'datetime' }));
  });

  it('createAppointment_ShouldReturn422_WhenNameExceedsMaxLength', async () => {
    const res = await request(app)
      .post('/appointments')
      .send({ ...validBody, name: 'A'.repeat(CONTACT_VALIDATION.NAME_MAX_LENGTH + 1) });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'name' }));
  });

  it('createAppointment_ShouldReturn422_WhenNotesExceedMaxLength', async () => {
    const res = await request(app)
      .post('/appointments')
      .send({ ...validBody, notes: 'A'.repeat(APPOINTMENT_VALIDATION.NOTES_MAX_LENGTH + 1) });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'notes' }));
  });

  it('createAppointment_ShouldReturn200_WhenEmailServiceFails', async () => {
    mockSend.mockRejectedValue(new Error('Resend API error'));
    const res = await request(app).post('/appointments').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });

  it('createAppointment_ShouldReturn422_WhenDatetimeIsOutsideWorkingHours', async () => {
    // Monday at 18:00 UTC = 19:00–20:00 Amsterdam (always outside 09:00–17:00 working hours)
    const lateMonday = new Date(validBody.datetime);
    lateMonday.setUTCHours(18, 0, 0, 0);

    const res = await request(app)
      .post('/appointments')
      .send({ ...validBody, datetime: lateMonday.toISOString() });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'datetime' }));
  });

  it('createAppointment_ShouldReturn422_WhenDatetimeIsOnSunday', async () => {
    // Compute next Sunday at 10:00 UTC using pure UTC arithmetic (+7-day buffer avoids
    // near-midnight local/UTC date-boundary issues)
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 7); // ensure we're at least a week out
    d.setUTCDate(d.getUTCDate() + (7 - d.getUTCDay()) % 7); // advance to next Sunday in UTC
    d.setUTCHours(10, 0, 0, 0); // 10:00 UTC = 11:00 Amsterdam CET — looks like a valid slot time but Sunday

    const res = await request(app)
      .post('/appointments')
      .send({ ...validBody, datetime: d.toISOString() });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'datetime' }));
  });

  it('createAppointment_ShouldReturn422_WhenDatetimeExceedsBookingWindow', async () => {
    const tooFar = new Date();
    tooFar.setMonth(tooFar.getMonth() + BOOKING_WINDOW_MONTHS + 1);

    const res = await request(app)
      .post('/appointments')
      .send({ ...validBody, datetime: tooFar.toISOString() });

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'datetime' }));
  });

  it('createAppointment_ShouldReturn200_WhenDatetimeIsLastSlotOnBookingWindowBoundaryDay', async () => {
    // Without the end-of-day fix, bookingWindowEnd = now + BOOKING_WINDOW_MONTHS at the current
    // time-of-day. A slot at 16:00 Amsterdam on that same day (which is the last valid weekday
    // slot) would be rejected if the test runs before 16:00 UTC. With the fix, bookingWindowEnd
    // is extended to UTC 23:59:59.999, so all working-hour slots on the boundary day are accepted.

    // Compute the boundary date using UTC month arithmetic to avoid local-time boundary issues.
    const boundary = new Date();
    boundary.setUTCMonth(boundary.getUTCMonth() + BOOKING_WINDOW_MONTHS);

    // Walk back to the nearest Mon–Fri weekday (UTC day) so the slot passes the working-hours check.
    while (boundary.getUTCDay() === 0 || boundary.getUTCDay() === 6) {
      boundary.setUTCDate(boundary.getUTCDate() - 1);
    }

    // 16:00 Amsterdam is the last valid weekday slot (schedule end 17:00 − 60 min duration).
    const lastSlot = createSlotInTimezone(boundary, 16, 0, BUSINESS_TIMEZONE);

    const res = await request(app)
      .post('/appointments')
      .send({ ...validBody, datetime: lastSlot.toISOString() });

    expect(res.status).toBe(200);
  });

  it('createAppointment_ShouldReturn503_WhenAvailabilityRecheckThrows', async () => {
    process.env.GOOGLE_CALENDAR_ID = 'test-cal-id';
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'sa@test.iam.gserviceaccount.com';
    process.env.GOOGLE_PRIVATE_KEY = 'test-key';

    // Token succeeds, list-events call throws a network error
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'mock-token' }) })
      .mockRejectedValueOnce(new Error('Network error'));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let isolatedApp: any;
    await jest.isolateModulesAsync(async () => {
      const { default: freshApp } = await import('../../src/app');
      isolatedApp = freshApp;
    });

    delete process.env.GOOGLE_CALENDAR_ID;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;

    const res = await request(isolatedApp).post('/appointments').send(validBody);

    expect(res.status).toBe(503);
  });

  it('createAppointment_ShouldReturn422_WhenSlotIsUnavailable', async () => {
    // Configure calendar via isolated module with env vars
    process.env.GOOGLE_CALENDAR_ID = 'test-cal-id';
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'sa@test.iam.gserviceaccount.com';
    process.env.GOOGLE_PRIVATE_KEY = 'test-key';

    // isSlotAvailable → token + list events (returns conflicting event)
    const slotStart = new Date(validBody.datetime);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'mock-token' }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            { start: { dateTime: slotStart.toISOString() }, end: { dateTime: slotEnd.toISOString() } },
          ],
        }),
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let isolatedApp: any;
    await jest.isolateModulesAsync(async () => {
      const { default: freshApp } = await import('../../src/app');
      isolatedApp = freshApp;
    });

    delete process.env.GOOGLE_CALENDAR_ID;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;

    const res = await request(isolatedApp).post('/appointments').send(validBody);

    expect(res.status).toBe(422);
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'datetime' }));
  });
});
