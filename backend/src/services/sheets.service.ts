import { createPrivateKey, createSign } from 'node:crypto';
import type { ValidatedContactPayload } from '../types/contact.types';
import { SHEETS_RANGE, SHEETS_SCOPES } from '../constants/contact.constants';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

async function getAccessToken(serviceAccountEmail: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claimSet = Buffer.from(
    JSON.stringify({
      iss: serviceAccountEmail,
      scope: SHEETS_SCOPES.join(' '),
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

export function createSheetsService(
  serviceAccountEmail: string,
  privateKey: string,
  sheetId: string,
) {
  const normalizedKey = privateKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();

  async function appendContactSubmission(payload: ValidatedContactPayload): Promise<void> {
    const accessToken = await getAccessToken(serviceAccountEmail, normalizedKey);

    const row = [
      new Date().toISOString(),
      payload.name,
      payload.email,
      payload.phone,
      payload.service,
      payload.message,
    ];

    // RAW prevents Google Sheets from interpreting cell values as formulas,
    // guarding against formula/CSV injection (e.g. =IMPORTDATA(...) in user input).
    const url = `${SHEETS_API_BASE}/${sheetId}/values/${encodeURIComponent(SHEETS_RANGE)}:append?valueInputOption=RAW`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', errorText);
      throw new Error('Failed to save contact submission');
    }
  }

  return { appendContactSubmission };
}

export type SheetsService = ReturnType<typeof createSheetsService>;
