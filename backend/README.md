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
│   │   └── contact.constants.ts  # Contact route and rate-limit constants
│   ├── routes/
│   │   ├── health.ts     # GET /health → { status: 'ok' }
│   │   └── contact.ts    # POST /api/contact — contact form submission
│   ├── services/
│   │   ├── email.service.ts      # Resend email delivery
│   │   └── sheets.service.ts     # Google Sheets logging
│   └── types/
│       └── contact.types.ts      # Contact form TypeScript interfaces
├── tests/
│   ├── health.test.ts            # /health endpoint tests
│   ├── instrument.test.ts        # Sentry initialisation tests
│   ├── sentry.middleware.test.ts # Sentry Express error handler tests
│   ├── routes/
│   │   └── contact.test.ts       # /api/contact endpoint tests
│   └── services/
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
| `CONTACT_OWNER_EMAIL` | — | Recipient address for contact form submissions |
| `GOOGLE_SHEETS_ID` | — | Google Spreadsheet ID for contact form logging |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | — | Google service account used for Sheets API access |
| `GOOGLE_PRIVATE_KEY` | — | Private key for the Google service account (PEM format) |
| `SENTRY_DSN` | — | Sentry DSN for runtime error reporting. Leave empty to disable Sentry locally. |

## Error Monitoring

Runtime errors are captured by [Sentry](https://sentry.io) via `@sentry/node`.

`src/instrument.ts` initialises the SDK and must be imported before any other module — both entry points (`src/index.ts` for Node.js and `api/index.ts` for Vercel) do this as their first side-effect import. `Sentry.setupExpressErrorHandler(app)` is registered in `app.ts` after all routes so unhandled errors are forwarded to Sentry before reaching the generic error handler.

Sentry is skipped entirely when `SENTRY_DSN` is not set, so local development works without any configuration.

## API Endpoints

| Method | Path | Description | Response |
|---|---|---|---|
| `GET` | `/health` | Health check | `{ "status": "ok" }` (200) |

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
