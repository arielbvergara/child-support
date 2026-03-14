import { Router, type IRouter } from 'express';
import type { Request, Response } from 'express';
import { createEmailService } from '../services/email.service';
import { createSheetsService } from '../services/sheets.service';
import {
  CONTACT_VALIDATION,
  GOOGLE_SHEETS_BASE_URL,
  HTTP_STATUS,
} from '../constants/contact.constants';
import type { ContactRequestBody, ValidatedContactPayload, ValidationError } from '../types/contact.types';

function validateContactBody(body: ContactRequestBody): {
  payload: ValidatedContactPayload | null;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const service = typeof body.service === 'string' ? body.service.trim() : '';

  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.length > CONTACT_VALIDATION.NAME_MAX_LENGTH) {
    errors.push({
      field: 'name',
      message: `Name must not exceed ${CONTACT_VALIDATION.NAME_MAX_LENGTH} characters`,
    });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!CONTACT_VALIDATION.EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Email must be a valid email address' });
  }

  if (!message) {
    errors.push({ field: 'message', message: 'Message is required' });
  } else if (message.length > CONTACT_VALIDATION.MESSAGE_MAX_LENGTH) {
    errors.push({
      field: 'message',
      message: `Message must not exceed ${CONTACT_VALIDATION.MESSAGE_MAX_LENGTH} characters`,
    });
  }

  if (errors.length > 0) {
    return { payload: null, errors };
  }

  return { payload: { name, email, phone, service, message }, errors: [] };
}

export function createContactRouter(): IRouter {
  const router = Router();
  const sheetsUrl = process.env.GOOGLE_SHEETS_ID
    ? `${GOOGLE_SHEETS_BASE_URL}/${process.env.GOOGLE_SHEETS_ID}`
    : undefined;
  const emailService = createEmailService(
    process.env.RESEND_API_KEY ?? '',
    process.env.RESEND_FROM_EMAIL ?? '',
    process.env.CONTACT_OWNER_EMAIL ?? '',
    sheetsUrl,
  );
  const sheetsService =
    process.env.GOOGLE_SHEETS_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
      ? createSheetsService(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          process.env.GOOGLE_PRIVATE_KEY,
          process.env.GOOGLE_SHEETS_ID,
        )
      : null;

  router.post(
    '/',
    async (req: Request<object, object, ContactRequestBody>, res: Response) => {
      const { payload, errors } = validateContactBody(req.body as ContactRequestBody);

      if (errors.length > 0) {
        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({ errors });
        return;
      }

      const results = await Promise.allSettled([
        emailService.sendContactEmails(payload!),
        sheetsService ? sheetsService.appendContactSubmission(payload!) : Promise.resolve(),
      ]);

      if (results[0].status === 'rejected') {
        console.error('Failed to send contact emails:', results[0].reason);
      }
      if (results[1].status === 'rejected') {
        console.error('Failed to append to Google Sheets:', results[1].reason);
      }

      res.status(HTTP_STATUS.OK).json({ success: true });
    },
  );

  return router;
}
