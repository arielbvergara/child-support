import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { SENTRY_INGEST_ORIGIN } from './lib/sentry';

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Single middleware entry point that combines:
 *  1. next-intl locale routing (detection, redirects, cookie)
 *  2. Per-request nonce-based Content-Security-Policy
 *
 * The nonce is injected as `x-nonce` in the forwarded request headers so that
 * async server components (e.g. JsonLd.tsx) can read it via `headers()` from
 * `next/headers` and attach it to inline `<script>` elements.
 *
 * For locale-redirect responses (3xx) the nonce is not needed — we add the
 * CSP header and return the redirect as-is.
 *
 * For pass-through responses (200) we create a fresh NextResponse.next() with
 * the nonce-enriched request headers and copy any headers set by the intl
 * middleware (locale cookie, etc.) onto it.
 *
 * Style rules still use `'unsafe-inline'` because Tailwind CSS and Next.js
 * inject styles inline at runtime and there is no official nonce support for
 * stylesheets in the current Next.js version.
 */
export default function middleware(request: NextRequest): NextResponse {
  // crypto.randomUUID() is available in the Next.js Edge Runtime.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const isDev = process.env.NODE_ENV === 'development';
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? '';

  const csp = [
    "default-src 'self'",
    // Allow same-origin scripts plus any script carrying the current nonce.
    // 'unsafe-eval' is only permitted in development (hot-module reload).
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ''}`,
    // Inline styles are still required by Tailwind CSS / Next.js.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    // Allow fetch/XHR to the backend API and Sentry error reporting.
    `connect-src 'self' ${SENTRY_INGEST_ORIGIN}${apiOrigin ? ` ${apiOrigin}` : ''}`,
    // Disallow embedding this page in any frame (clickjacking protection).
    "frame-ancestors 'none'",
  ].join('; ');

  // Step 1: Let next-intl handle locale detection, redirects, and cookie setting.
  const intlResponse = intlMiddleware(request);

  // Step 2: For locale-normalisation redirects (3xx), attach CSP and return.
  // The nonce is irrelevant for redirect responses.
  if (intlResponse.status >= 300) {
    intlResponse.headers.set('Content-Security-Policy', csp);
    return intlResponse;
  }

  // Step 3: For pass-through (next()) responses, create a NextResponse.next()
  // with the nonce injected into the forwarded request headers so that
  // server components can read it via `headers()` from 'next/headers'.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Step 4: Copy headers set by the intl middleware (e.g. locale cookie) onto
  // our response so they are not lost.
  intlResponse.headers.forEach((value, key) => {
    response.headers.append(key, value);
  });

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
