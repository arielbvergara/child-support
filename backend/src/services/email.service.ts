import { Resend } from 'resend';
import type { ValidatedContactPayload } from '../types/contact.types';

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
    const phoneLine = payload.phone
      ? `<tr><td><strong>Phone:</strong></td><td>${payload.phone}</td></tr>`
      : '';
    const serviceLine = payload.service
      ? `<tr><td><strong>Service:</strong></td><td>${payload.service}</td></tr>`
      : '';
    const sheetsLinkSection = sheetsUrl
      ? `
        <p style="margin-top:24px;">
          <a href="${sheetsUrl}"
             style="background:#1a73e8;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:bold;">
            View all submissions in Google Sheets
          </a>
        </p>`
      : '';

    await resend.emails.send({
      from: fromEmail,
      to: [ownerEmail],
      subject: `New contact request from ${payload.name}`,
      html: `
        <h2>You have received a new contact request</h2>
        <table cellpadding="8">
          <tr><td><strong>Name:</strong></td><td>${payload.name}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${payload.email}</td></tr>
          ${phoneLine}
          ${serviceLine}
          <tr><td><strong>Message:</strong></td><td>${payload.message}</td></tr>
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
