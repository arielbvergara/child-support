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
import {
  extractStringField,
  validateName,
  validateEmail,
  validatePhone,
  validateService,
} from '../utils/validation';

function validateContactBody(body: ContactRequestBody): {
  payload: ValidatedContactPayload | null;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  const name = extractStringField(body.name);
  const email = extractStringField(body.email);
  const message = extractStringField(body.message);
  const phone = extractStringField(body.phone);
  const service = extractStringField(body.service);

  validateName(name, errors);
  validateEmail(email, errors);
  validatePhone(phone, errors);
  validateService(service, errors);

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
        const reason = results[0].reason;
        console.error('Failed to send contact notification email', {
          err: reason instanceof Error ? reason.message : String(reason),
        });
      }
      if (results[1].status === 'rejected') {
        const reason = results[1].reason;
        console.error('Failed to save contact submission to Google Sheets', {
          err: reason instanceof Error ? reason.message : String(reason),
        });
      }

      res.status(HTTP_STATUS.OK).json({ success: true });
    },
  );

  return router;
}
