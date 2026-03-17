# Backend

Express.js REST API for the Child & Family Development Support platform. Written in TypeScript and designed for extension as the platform grows.

## Technology Stack

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20 (Alpine) | Runtime |
| Express.js | ^4.21.2 | HTTP framework |
| TypeScript | ^5 | Language (strict mode, ES2022 target) |
| tsx | — | Dev runner with hot reload |
| Jest + Supertest | — | Unit and integration testing |
| @sentry/node | — | Error monitoring |
| ESLint + Prettier | — | Linting and formatting |
| Docker | — | Containerization |

## Project Structure

```
backend/
├── api/
│   └── index.ts          # Vercel serverless entrypoint — initialises Sentry, exports app
├── src/
│   ├── index.ts          # Node.js entrypoint — loads .env, initialises Sentry, starts Express on PORT
│   ├── instrument.ts     # Sentry SDK initialisation (imported before all other modules)
│   ├── app.ts            # App factory (createApp) — middleware, routes, and error handlers
│   ├── constants/
│   │   ├── appointment.constants.ts  # Appointment booking constants (working schedule, timezone, rate limits)
│   │   └── contact.constants.ts      # Contact route and rate-limit constants
│   ├── routes/
│   │   ├── appointment.ts  # GET /appointments/availability, POST /appointments
│   │   ├── contact.ts      # POST /api/contact — contact form submission
│   │   └── health.ts       # GET /health → { status: 'ok' }
│   ├── services/
│   │   ├── calendar.service.ts  # Google Calendar availability and event creation
│   │   ├── email.service.ts     # Resend email delivery
│   │   └── sheets.service.ts    # Google Sheets logging
│   └── types/
│       ├── appointment.types.ts  # Appointment booking TypeScript interfaces
│       └── contact.types.ts      # Contact form TypeScript interfaces
├── tests/
│   ├── health.test.ts            # /health endpoint tests
│   ├── instrument.test.ts        # Sentry initialisation tests
│   ├── sentry.middleware.test.ts # Sentry Express error handler tests
│   ├── routes/
│   │   ├── appointment.test.ts   # /appointments endpoint tests
│   │   └── contact.test.ts       # /api/contact endpoint tests
│   └── services/
│       ├── calendar.service.test.ts
│       ├── email.service.test.ts
│       └── sheets.service.test.ts
├── Dockerfile            # Multi-stage production image (node:20-alpine)
├── docker-compose.yml    # Local container orchestration
├── tsconfig.json         # TypeScript compiler config
├── jest.config.js        # Jest configuration (ts-jest preset)
├── eslint.config.mjs     # ESLint rules
├── .prettierrc           # Prettier formatting rules
└── .env.example          # Example environment variables
```

## Getting Started

### Local development

```bash
# From the repo root
pnpm dev:backend

# Or from the backend directory
cd backend
pnpm dev
```

The server starts on `http://localhost:3001` with file-watching hot reload via `tsx`.

### Available scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `tsx watch src/index.ts` | Development server with hot reload |
| `build` | `tsc` | Compile TypeScript to `dist/` |
| `start` | `node dist/index.js` | Run the compiled production build |
| `lint` | `eslint src/` | Run ESLint on source files |
| `format` | `prettier --write src/` | Format source files |
| `typecheck` | `tsc --noEmit` | Type check without emitting output |
| `test` | `jest` | Run the test suite |

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port the HTTP server listens on |
| `NODE_ENV` | `development` | Runtime environment (`development` \| `production`) |
| `ALLOWED_ORIGINS` | — | Comma-separated list of allowed CORS origins (required in production) |
| `RESEND_API_KEY` | — | Resend API key for email delivery |
| `RESEND_FROM_EMAIL` | — | Sender address for outgoing emails |
| `CONTACT_OWNER_EMAIL` | — | Recipient address for contact form and appointment notification emails |
| `GOOGLE_SHEETS_ID` | — | Google Spreadsheet ID for contact form logging |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | — | Google service account email used for Sheets and Calendar API access |
| `GOOGLE_PRIVATE_KEY` | — | Private key for the Google service account (PEM format, `\n`-escaped) |
| `GOOGLE_CALENDAR_ID` | — | Calendar ID where appointment events are created. Use `primary` for the default calendar, or the calendar's email address for a dedicated one. The service account must be granted "Make changes to events" permission on this calendar. Omit to disable Calendar integration (availability shows all working-hour slots without conflict checking). |
| `SENTRY_DSN` | — | Sentry DSN for runtime error reporting. Leave empty to disable Sentry locally. |

## Error Monitoring

Runtime errors are captured by [Sentry](https://sentry.io) via `@sentry/node`.

`src/instrument.ts` initialises the SDK and must be imported before any other module — both entry points (`src/index.ts` for Node.js and `api/index.ts` for Vercel) do this as their first side-effect import. `Sentry.setupExpressErrorHandler(app)` is registered in `app.ts` after all routes so unhandled errors are forwarded to Sentry before reaching the generic error handler.

Sentry is skipped entirely when `SENTRY_DSN` is not set, so local development works without any configuration.

## API Endpoints

| Method | Path | Description | Response |
|---|---|---|---|
| `GET` | `/health` | Health check | `{ "status": "ok" }` (200) |
| `POST` | `/api/contact` | Contact form submission — validates input, logs to Google Sheets, and sends email notifications | `{ "success": true }` (200) or `{ "errors": [...] }` (422) |
| `GET` | `/appointments/availability` | Returns available booking slots within the configured booking window. Uses Google Calendar when configured; falls back to all working-hour slots otherwise. | `{ "slots": [{ "datetime": "ISO string" }] }` (200) |
| `POST` | `/appointments` | Books an appointment — validates payload, re-checks slot availability against Google Calendar, creates the calendar event, and sends confirmation emails | `{ "success": true }` (200), `{ "errors": [...] }` (422), or `{ "error": "..." }` (503) |

### Appointment booking behaviour

- **Working schedule** — weekdays 09:00–17:00 and Saturdays 10:00–14:00, Amsterdam time (`Europe/Amsterdam`). Submitted `datetime` values are validated against this schedule; off-hours or off-day requests receive a 422.
- **Booking window** — slots are offered and accepted up to 2 months from today. Requests beyond the window receive a 422.
- **Slot duration** — 60 minutes. The `datetime` must align to a slot boundary (e.g. 09:00, 10:00).
- **Conflict check** — when Google Calendar is configured, the slot is re-checked immediately before confirming to prevent double-bookings. A transient Calendar API failure returns 503 so the client can retry safely.
- **Availability cache** — availability results are cached in memory for 5 minutes and invalidated immediately after a successful booking to keep slot lists fresh.
- **Rate limiting** — `POST /appointments` is limited to 5 requests per 15 minutes per IP. `GET /appointments/availability` is not rate-limited.

## Running Tests

```bash
# From the repo root
pnpm test

# Or from the backend directory
cd backend
pnpm test
```

Tests use Jest with the `ts-jest` preset and Supertest for HTTP-level integration testing.

### Test naming convention

All tests follow the pattern: `{MethodName}_Should{doSomething}_When{Condition}`

## Docker

### Build and run with Docker Compose

```bash
cd backend
docker-compose up --build
```

The service listens on port `3001` and restarts automatically unless manually stopped.

### Manual Docker build

```bash
cd backend
docker build -t cfds-backend .
docker run -p 3001:3001 --env-file .env cfds-backend
```

The Dockerfile uses a multi-stage build:

1. **base** — `node:20-alpine` with pnpm enabled
2. **deps** — installs dependencies from the lockfile
3. **builder** — compiles TypeScript to `dist/`
4. **runner** — minimal final image with only built artifacts and production dependencies
