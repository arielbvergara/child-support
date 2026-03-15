# Child & Family Development Support

A multilingual web platform for **Pedagogisch Advies** — a child and family development support service. The project consists of a Next.js marketing frontend and an Express.js API backend, organized as a pnpm monorepo.

## Project Structure

```
.
├── frontend/          # Next.js 16 web application (React 19, Tailwind CSS, next-intl)
├── backend/           # Express.js REST API (TypeScript, Node.js 20)
├── .github/           # CI/CD workflows and Dependabot configuration
├── .husky/            # Git hooks (pre-commit linting, pre-push tests)
├── package.json       # Monorepo root scripts
└── pnpm-workspace.yaml
```

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Internationalization | next-intl — Dutch (default), English, German |
| Backend | Express.js, TypeScript, Node.js 20 |
| Package Manager | pnpm v10 (workspaces) |
| Testing | Jest, Supertest |
| Error Monitoring | Sentry (`@sentry/nextjs`, `@sentry/node`) |
| CI/CD | GitHub Actions, Dependabot |
| Containerization | Docker (Alpine), docker-compose |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 10

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Run both services in development

Open two terminal tabs:

```bash
# Terminal 1 — frontend on http://localhost:3000
pnpm dev:frontend

# Terminal 2 — backend on http://localhost:3001
pnpm dev:backend
```

### Available root scripts

| Script | Description |
|---|---|
| `pnpm dev:frontend` | Start the Next.js dev server |
| `pnpm dev:backend` | Start the Express dev server with hot reload |
| `pnpm build` | Build both frontend and backend for production |
| `pnpm lint` | Run ESLint across both packages |
| `pnpm typecheck` | Run TypeScript type checking across both packages |
| `pnpm test` | Run the backend test suite |

## Development Workflow

This project enforces quality gates through Git hooks:

- **pre-commit** — runs `lint` and `typecheck`
- **pre-push** — runs `test` and `build`

All CI checks (typecheck, lint, test, build) are also enforced via GitHub Actions on every pull request and push to `main`/`master`/`develop`.

## Package Documentation

- [Frontend README](./frontend/README.md) — Next.js app, routing, components, i18n, and styling
- [Backend README](./backend/README.md) — Express API, endpoints, environment variables, and Docker setup
