import { headers } from 'next/headers';

interface JsonLdProps {
  schema: Record<string, unknown>;
}

/**
 * Renders a JSON-LD structured-data <script> tag.
 *
 * The nonce is read from the `x-nonce` request header injected by
 * middleware.ts so that the script passes the per-request nonce check
 * in the Content-Security-Policy header — required because the CSP
 * no longer allows `'unsafe-inline'` for scripts.
 */
export async function JsonLd({ schema }: JsonLdProps) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
