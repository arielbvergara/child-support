import { Resend } from 'resend';
import type { ValidatedContactPayload } from '../types/contact.types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips CR, LF, and other ASCII control characters from a string to prevent
 * email header injection when the value is used in a header field (e.g. subject).
 */
function sanitizeForHeader(str: string): string {
  // eslint-disable-next-line no-control-regex -- intentional: strips ASCII control chars to prevent header injection
  return str.replace(/[\r\n\x00-\x1f\x7f]/g, '');
}

export function createEmailService(
  apiKey: string,
  fromEmail: string,
  ownerEmail: string,
  sheetsUrl?: string,
) {
  async function sendOwnerNotification(
    resend: Resend,
    payload: ValidatedContactPayload,
  ): Promise<void> {
    const safeName = escapeHtml(payload.name);
    const safeEmail = escapeHtml(payload.email);
    const safePhone = payload.phone ? escapeHtml(payload.phone) : '';
    const safeService = payload.service ? escapeHtml(payload.service) : '';
    const safeMessage = escapeHtml(payload.message);

    const phoneLine = safePhone
      ? `<tr><td><strong>Phone:</strong></td><td>${safePhone}</td></tr>`
      : '';
    const serviceLine = safeService
      ? `<tr><td><strong>Service:</strong></td><td>${safeService}</td></tr>`
      : '';
    const sheetsLinkSection = sheetsUrl
      ? `
        <p style="margin-top:24px;">
          <a href="${escapeHtml(sheetsUrl)}"
             style="background:#1a73e8;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:bold;">
            View all submissions in Google Sheets
          </a>
        </p>`
      : '';

    await resend.emails.send({
      from: fromEmail,
      to: [ownerEmail],
      subject: `New contact request from ${sanitizeForHeader(payload.name)}`,
      html: `
        <h2>You have received a new contact request</h2>
        <table cellpadding="8">
          <tr><td><strong>Name:</strong></td><td>${safeName}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${safeEmail}</td></tr>
          ${phoneLine}
          ${serviceLine}
          <tr><td><strong>Message:</strong></td><td>${safeMessage}</td></tr>
        </table>
        ${sheetsLinkSection}
      `,
    });
  }

  // TODO: Re-enable auto-reply once a custom sender domain is verified in Resend.
  // The Resend free plan restricts delivery to verified addresses only, which means
  // auto-replies to arbitrary visitor emails will fail until a domain is configured.
  // See: https://resend.com/docs/dashboard/domains/introduction

  async function sendContactEmails(payload: ValidatedContactPayload): Promise<void> {
    const resend = new Resend(apiKey);
    await sendOwnerNotification(resend, payload);
  }

  return { sendContactEmails };
}

export type EmailService = ReturnType<typeof createEmailService>;
