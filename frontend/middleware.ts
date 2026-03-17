import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SENTRY_INGEST_ORIGIN } from './lib/sentry';

/**
 * Middleware that generates a per-request CSP nonce and attaches it to:
 *  - the *request* headers (`x-nonce`) so server components can read it
 *    via `headers()` from `next/headers` and pass it to inline scripts.
 *  - the *response* `Content-Security-Policy` header to replace the static
 *    policy set in next.config.ts with a strict, nonce-gated one.
 *
 * Using a nonce removes the need for `'unsafe-inline'` in `script-src`,
 * which prevents injected scripts from executing even if an attacker
 * manages to embed arbitrary HTML into the page (XSS mitigation).
 *
 * Style rules still use `'unsafe-inline'` because Tailwind CSS and
 * Next.js inject styles inline at runtime and there is no official
 * nonce support for stylesheets in the current Next.js version.
 */
export function middleware(request: NextRequest): NextResponse {
  // crypto.randomUUID() is available in the Next.js Edge Runtime.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const isDev = process.env.NODE_ENV === 'development';
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? '';

  const cspDirectives = [
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
  ];

  const csp = cspDirectives.join('; ');

  // Propagate the nonce to server components so they can attach it to
  // inline <script> elements (e.g. JSON-LD structured data in JsonLd.tsx).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *  - _next/static  (compiled JS/CSS assets – no document, no nonce needed)
     *  - _next/image   (image optimisation API)
     *  - favicon.ico
     *  - common static file extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
