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
| ESLint + Prettier | — | Linting and formatting |
| Docker | — | Containerization |

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Entry point — loads .env, starts Express on PORT
│   ├── app.ts            # App factory — middleware setup and route registration
│   └── routes/
│       └── health.ts     # GET /health → { status: 'ok' }
├── tests/
│   └── health.test.ts    # Supertest integration test for /health
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
