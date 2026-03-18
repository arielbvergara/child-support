import { Router, type IRouter } from 'express';
import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { createCalendarService, generateAllWorkingSlots } from '../services/calendar.service';
import { createEmailService } from '../services/email.service';
import {
  BOOKING_WINDOW_MONTHS,
  APPOINTMENT_VALIDATION,
  APPOINTMENT_RATE_LIMIT_MAX,
  APPOINTMENT_RATE_LIMIT_WINDOW_MS,
  AVAILABILITY_RATE_LIMIT_MAX,
  BUSINESS_TIMEZONE,
  WORKING_SCHEDULE,
  SLOT_DURATION_MINUTES,
} from '../constants/appointment.constants';
import { CONTACT_VALIDATION, HTTP_STATUS } from '../constants/contact.constants';
import type {
  AppointmentRequestBody,
  ValidatedAppointmentPayload,
} from '../types/appointment.types';
import type { ValidationError } from '../types/contact.types';

/**
 * Returns the local hour, minute, and day-of-week (0=Sun…6=Sat) for a Date
 * as seen in the given IANA timezone. Uses numeric date parts only (no string
 * weekday names) to avoid variation across Node.js ICU builds.
 */
function getTimePartsInTimezone(
  date: Date,
  timezone: string,
): { hour: number; minute: number; dayOfWeek: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parseInt(parts.find((p) => p.type === type)!.value, 10);
  const year = get('year');
  const month = get('month'); // 1-indexed
  const day = get('day');

  // Derive day of week from the local date components — immune to ICU weekday format differences
  const dayOfWeek = new Date(year, month - 1, day).getDay();

  return { hour: get('hour'), minute: get('minute'), dayOfWeek };
}

function validateAppointmentBody(body: AppointmentRequestBody): {
  payload: ValidatedAppointmentPayload | null;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const service = typeof body.service === 'string' ? body.service.trim() : '';
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
  const datetime = typeof body.datetime === 'string' ? body.datetime.trim() : '';

  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.length > CONTACT_VALIDATION.NAME_MAX_LENGTH) {
    errors.push({ field: 'name', message: `Name must not exceed ${CONTACT_VALIDATION.NAME_MAX_LENGTH} characters` });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (email.length > CONTACT_VALIDATION.EMAIL_MAX_LENGTH) {
    errors.push({ field: 'email', message: 'Email address is too long' });
  } else if (!CONTACT_VALIDATION.EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Email must be a valid email address' });
  }

  if (phone && phone.length > CONTACT_VALIDATION.PHONE_MAX_LENGTH) {
    errors.push({ field: 'phone', message: `Phone number must not exceed ${CONTACT_VALIDATION.PHONE_MAX_LENGTH} characters` });
  }

  if (service && service.length > CONTACT_VALIDATION.SERVICE_MAX_LENGTH) {
    errors.push({ field: 'service', message: `Service selection must not exceed ${CONTACT_VALIDATION.SERVICE_MAX_LENGTH} characters` });
  }

  if (notes && notes.length > APPOINTMENT_VALIDATION.NOTES_MAX_LENGTH) {
    errors.push({ field: 'notes', message: `Notes must not exceed ${APPOINTMENT_VALIDATION.NOTES_MAX_LENGTH} characters` });
  }

  if (!datetime) {
    errors.push({ field: 'datetime', message: 'Appointment date and time is required' });
  } else {
    const parsed = new Date(datetime);

    if (isNaN(parsed.getTime())) {
      errors.push({ field: 'datetime', message: 'Appointment date and time must be a valid ISO 8601 date' });
    } else if (parsed <= new Date()) {
      errors.push({ field: 'datetime', message: 'Appointment must be scheduled in the future' });
    } else {
      // Booking window check: must not exceed the same window used by /availability.
      // Extend to end-of-UTC-day so all working-hour slots on the last eligible day are
      // accepted — slot generation includes every slot up to the schedule end (17:00
      // Amsterdam = at most 16:00 UTC), which is always before UTC 23:59:59.
      const bookingWindowEnd = new Date();
      bookingWindowEnd.setUTCMonth(bookingWindowEnd.getUTCMonth() + BOOKING_WINDOW_MONTHS);
      bookingWindowEnd.setUTCHours(23, 59, 59, 999);
      if (parsed > bookingWindowEnd) {
        errors.push({ field: 'datetime', message: `Appointment must be within ${BOOKING_WINDOW_MONTHS} months from today` });
      } else {
        // Working-hours check: day and time must align with WORKING_SCHEDULE in business timezone
        const { hour, minute, dayOfWeek } = getTimePartsInTimezone(parsed, BUSINESS_TIMEZONE);
        const schedule = WORKING_SCHEDULE.find((s) =>
          (s.days as readonly number[]).includes(dayOfWeek),
        );

        if (!schedule) {
          errors.push({ field: 'datetime', message: 'No appointments are available on this day' });
        } else {
          const [schedStartHour, schedStartMin] = schedule.start.split(':').map(Number);
          const [schedEndHour, schedEndMin] = schedule.end.split(':').map(Number);
          const slotMinutes = hour * 60 + minute;
          const schedStartMinutes = schedStartHour * 60 + schedStartMin;
          const schedEndMinutes = schedEndHour * 60 + schedEndMin;

          if (
            slotMinutes < schedStartMinutes ||
            slotMinutes + SLOT_DURATION_MINUTES > schedEndMinutes ||
            (slotMinutes - schedStartMinutes) % SLOT_DURATION_MINUTES !== 0
          ) {
            errors.push({ field: 'datetime', message: 'Selected time is not a valid appointment slot' });
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    return { payload: null, errors };
  }

  return { payload: { name, email, phone, service, notes, datetime }, errors: [] };
}

export function createAppointmentRouter(): IRouter {
  const router = Router();

  // Rate limiter scoped to POST only — GET /availability must not be throttled
  // since it is called on every page load.
  const bookingRateLimit = rateLimit({
    windowMs: APPOINTMENT_RATE_LIMIT_WINDOW_MS,
    max: APPOINTMENT_RATE_LIMIT_MAX,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
  });

  // Permissive limiter for the availability endpoint — protects against
  // abusive polling without impacting legitimate page-load traffic.
  const availabilityRateLimit = rateLimit({
    windowMs: APPOINTMENT_RATE_LIMIT_WINDOW_MS,
    max: AVAILABILITY_RATE_LIMIT_MAX,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
  });

  const calendarService =
    process.env.GOOGLE_CALENDAR_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
      ? createCalendarService(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          process.env.GOOGLE_PRIVATE_KEY,
          process.env.GOOGLE_CALENDAR_ID,
        )
      : null;

  const emailService = createEmailService(
    process.env.RESEND_API_KEY ?? '',
    process.env.RESEND_FROM_EMAIL ?? '',
    process.env.CONTACT_OWNER_EMAIL ?? '',
  );

  router.get('/availability', availabilityRateLimit, async (_req: Request, res: Response) => {
    const from = new Date();
    const to = new Date();
    to.setUTCMonth(to.getUTCMonth() + BOOKING_WINDOW_MONTHS);
    // Extend to end-of-UTC-day to match the booking window used in validateAppointmentBody,
    // ensuring every slot on the last eligible day is included in availability.
    to.setUTCHours(23, 59, 59, 999);

    if (!calendarService) {
      const slots = generateAllWorkingSlots(from, to);
      res.status(HTTP_STATUS.OK).json({ slots });
      return;
    }

    try {
      const slots = await calendarService.getAvailableSlots(from, to);
      res.status(HTTP_STATUS.OK).json({ slots });
    } catch (err) {
      console.error('Failed to fetch available slots', {
        err: err instanceof Error ? err.message : String(err),
      });
      // Fallback: return all working-hour slots without conflict checks
      const slots = generateAllWorkingSlots(from, to);
      res.status(HTTP_STATUS.OK).json({ slots });
    }
  });

  router.post(
    '/',
    bookingRateLimit,
    async (req: Request<object, object, AppointmentRequestBody>, res: Response) => {
      const { payload, errors } = validateAppointmentBody(req.body as AppointmentRequestBody);

      if (errors.length > 0) {
        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({ errors });
        return;
      }

      // Re-check slot availability to guard against race conditions.
      // null = check itself failed (transient error) → 503 so client can retry.
      if (calendarService) {
        const available: boolean | null = await calendarService
          .isSlotAvailable(payload!.datetime)
          .catch((err) => {
            console.error('Availability re-check failed', {
              err: err instanceof Error ? err.message : String(err),
            });
            return null;
          });

        if (available === null) {
          res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
            error: 'Service temporarily unavailable. Please try again.',
          });
          return;
        }

        if (!available) {
          res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
            errors: [{ field: 'datetime', message: 'This time slot is no longer available' }],
          });
          return;
        }
      }

      // Create calendar event (critical — failure blocks the booking)
      if (calendarService) {
        try {
          await calendarService.createCalendarEvent(payload!);
        } catch (err) {
          console.error('Failed to create calendar event', {
            err: err instanceof Error ? err.message : String(err),
          });
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to create appointment. Please try again.',
          });
          return;
        }
      }

      // Send emails (non-critical — logged but does not fail the request)
      await emailService.sendAppointmentEmails(payload!);

      res.status(HTTP_STATUS.OK).json({ success: true });
    },
  );

  return router;
}
