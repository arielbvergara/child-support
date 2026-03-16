# Frontend

Next.js 16 web application for the Child & Family Development Support platform. Built with the App Router, TypeScript, Tailwind CSS v4, and full internationalization support for Dutch, English, and German.

## Technology Stack

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 16 | React framework (App Router) |
| React | 19 | UI library |
| TypeScript | ^5 | Language (strict mode) |
| Tailwind CSS | v4 | Utility-first styling |
| next-intl | ^4.8.3 | Internationalization (i18n) |
| framer-motion | — | Animations |
| lucide-react | — | Icon library |
| clsx + tailwind-merge | — | Conditional class name utilities |
| @sentry/nextjs | — | Error monitoring (client, server, and edge runtimes) |
| ESLint | — | Linting |

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                        # Root layout (Geist, Geist Mono, Lora fonts)
│   ├── globals.css                       # Global styles
│   └── [locale]/
│       ├── layout.tsx                    # Locale-aware layout wrapper
│       └── (marketing)/                  # Route group — marketing pages
│           ├── page.tsx                  # Home page
│           ├── about/page.tsx            # About page
│           ├── contact/page.tsx          # Contact page
│           ├── make-an-appointment/page.tsx # Appointment booking page
│           ├── privacy-policy/page.tsx   # Privacy policy
│           └── terms-of-service/page.tsx # Terms of service
├── components/
│   ├── layout/
│   │   ├── Header.tsx                    # Sticky nav with language switcher and mobile menu
│   │   ├── Footer.tsx                    # Site footer
│   │   └── MobileMenu.tsx                # Mobile navigation drawer
│   ├── ui/                               # Reusable primitive components
│   │   ├── Button.tsx                    # Polymorphic button (4 variants, 3 sizes)
│   │   ├── Card.tsx                      # Card container
│   │   ├── Badge.tsx                     # Badge component
│   │   ├── Heading.tsx                   # Typography heading
│   │   ├── SectionWrapper.tsx            # Section layout wrapper
│   │   ├── AppointmentForm.tsx           # Multi-step appointment booking form with calendar picker
│   │   └── ContactForm.tsx               # Contact form
│   ├── sections/
│   │   ├── landing/
│   │   │   ├── Hero.tsx                  # Hero section with CTA
│   │   │   ├── ServicesOverview.tsx      # Services grid
│   │   │   ├── TrustSignals.tsx          # Statistics and trust indicators
│   │   │   ├── AboutTeaser.tsx           # About section preview
│   │   │   └── LandingCta.tsx            # Call-to-action section
│   │   ├── contact/
│   │   │   ├── ContactInfo.tsx           # Contact information display
│   │   │   └── ContactFormSection.tsx    # Contact form section
│   │   └── about/
│   │       ├── BiographySection.tsx      # Biography content
│   │       ├── PhilosophySection.tsx     # Philosophy/pillars display
│   │       └── QualificationsSection.tsx # Credentials display
│   └── seo/
│       └── JsonLd.tsx                    # JSON-LD structured data injection
├── i18n/
│   ├── routing.ts                        # Locale routing config (locales, defaultLocale)
│   └── request.ts                        # next-intl server request handler
├── lib/
│   ├── constants.ts                      # Site config, nav links, services, testimonials
│   ├── types.ts                          # Shared TypeScript interfaces
│   └── metadata.ts                       # SEO metadata utilities
├── messages/
│   ├── en.json                           # English translations
│   ├── nl.json                           # Dutch translations
│   └── de.json                           # German translations
├── public/
│   └── images/                           # Static image assets
├── proxy.ts                              # next-intl middleware for locale routing
├── next.config.ts                        # Next.js configuration
├── postcss.config.mjs                    # PostCSS + Tailwind CSS plugin
└── tsconfig.json                         # TypeScript compiler config
```

## Getting Started

```bash
# From the repo root
pnpm dev:frontend

# Or from the frontend directory
cd frontend
pnpm dev
```

The app starts on `http://localhost:3000`. The default locale is Dutch, so `/` redirects to `/nl`.

### Available scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start development server |
| `build` | `next build` | Build for production |
| `start` | `next start` | Run the production build |
| `lint` | `eslint` | Run ESLint |
| `typecheck` | `tsc --noEmit` | Type check without emitting output |

## Internationalization

The app supports three locales via [next-intl](https://next-intl.dev/):

| Locale | Language | Default |
|---|---|---|
| `nl` | Dutch | Yes |
| `en` | English | No |
| `de` | German | No |

URL structure: `/{locale}/path` (e.g., `/en/about`, `/de/contact`)

All user-facing strings live in `messages/{locale}.json`. The middleware in `proxy.ts` intercepts all requests (except `/api`, `/_next`, `/_vercel`) and redirects to the appropriate locale prefix.

### Adding a new translation key

1. Add the key and value to all three files in `messages/`.
2. Use the key in a component via `useTranslations()` (client) or `getTranslations()` (server).

## Routing

The App Router uses a `[locale]` dynamic segment at the top level. The `(marketing)` route group organizes pages without affecting the URL.

| URL | Page |
|---|---|
| `/[locale]` | Home |
| `/[locale]/about` | About |
| `/[locale]/contact` | Contact |
| `/[locale]/make-an-appointment` | Appointment Booking |
| `/[locale]/privacy-policy` | Privacy Policy |
| `/[locale]/terms-of-service` | Terms of Service |

## UI Components

Reusable primitives live in `components/ui/`. Key patterns:

- **Button** — polymorphic (`as` prop); supports `primary`, `secondary`, `outline`, `ghost` variants and `sm`, `md`, `lg` sizes.
- **AppointmentForm** — multi-step booking form (contact details → date picker → time picker → confirmation). Fetches available slots from the backend API, renders a locale-aware calendar using `Intl.DateTimeFormat`, and submits the booking.
- **SectionWrapper** — standardizes section padding and max-width layout.
- **Heading** — controls heading level (`h1`–`h6`) and visual size independently.

## Site Configuration

Static content (contact details, navigation links, services, testimonials, credentials) is centralized in `lib/constants.ts`. Update this file to change site-wide content without touching individual components.

## Security Headers

The following HTTP security headers are applied to all routes via `next.config.ts`:

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

## Environment Variables

Copy `.env.example` to `.env.local` and adjust as needed:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL (e.g., `http://localhost:3001`) |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN for runtime error reporting. Leave empty to disable Sentry locally. |
| `SENTRY_AUTH_TOKEN` | No | Sentry auth token used **at build time only** to upload source maps and create releases. Without it, Sentry still captures errors but stack traces show minified/compiled code. Set this in your CI/CD environment and deployment platform (e.g., Vercel environment variables), never in `.env.local`. Generate one at sentry.io → User Auth Tokens with the `project:releases` scope. |

## Error Monitoring

Runtime errors are captured by [Sentry](https://sentry.io) across all three Next.js runtimes:

- **Client** (`sentry.client.config.ts`) — browser-side errors
- **Server** (`sentry.server.config.ts`) — SSR and API route errors
- **Edge** (`sentry.edge.config.ts`) — middleware errors

The `instrumentation.ts` file (Next.js App Router hook) loads the correct config per runtime at startup.

Sentry is skipped entirely when `NEXT_PUBLIC_SENTRY_DSN` is not set, so local development works without any configuration.
