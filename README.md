# Release Health Monitor — Production-minded rewrite

A React + Express CRUD application instrumented with Sentry. This rewrite keeps the original assignment's core behavior while adding validation, safer diagnostics, centralized API handling, graceful shutdown, security headers, rate limiting, tests, CI, and a deterministic source-map release workflow.

## What changed

- Added root `.gitignore`; `.env` files and OS artifacts are excluded.
- Added strict Zod validation for create/update requests.
- Added JSON body-size limits, Helmet, CORS allow-listing, and rate limiting.
- Added centralized API error handling and frontend request handling.
- Added React/Sentry error boundary.
- Added loading, disabled, and status states.
- Added graceful SIGTERM/SIGINT shutdown with Sentry flush.
- Diagnostic error endpoints are disabled unless `ENABLE_TEST_ERRORS=true`.
- Diagnostic controls are only rendered in Vite development mode.
- Production traces are sampled instead of sending 100% of transactions.
- Vite generates hidden source maps so maps can be uploaded to Sentry without being advertised as public assets.
- Sentry CLI is invoked at an explicit pinned version by the release script.
- Added backend API tests and GitHub Actions CI.

## Run locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Backend: `http://localhost:5000`
Frontend: `http://localhost:5173`

## Environment

Backend:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
SENTRY_DSN=
SENTRY_RELEASE=release-health-monitor@1.1.1
ENABLE_TEST_ERRORS=false
```

Frontend:

```env
VITE_API_URL=http://localhost:5000
VITE_SENTRY_DSN=
VITE_SENTRY_RELEASE=release-health-monitor@1.1.1
```

Never commit `.env` files or Sentry auth tokens.

## Sentry source maps

Set the Sentry CLI credentials in the CI/terminal environment, not in the frontend bundle:

```text
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

Then:

```bash
cd frontend
npm run build:sentry
```

The build creates hidden source maps and the release script uploads them to Sentry, then finalizes the release. If credentials are missing, the command fails instead of silently claiming the upload succeeded.

## Diagnostics

For controlled Sentry verification only, run the backend with:

```env
ENABLE_TEST_ERRORS=true
```

The frontend diagnostic controls are shown only in development builds. The backend diagnostic route captures an error without intentionally creating an unhandled promise rejection or crashing the service.

For production, keep `ENABLE_TEST_ERRORS=false`.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness/status |
| GET | `/api/items` | List notes |
| GET | `/api/items/:id` | Get note |
| POST | `/api/items` | Create note |
| PUT | `/api/items/:id` | Update note |
| DELETE | `/api/items/:id` | Delete note |
| POST | `/api/errors/*` | Development-only Sentry diagnostics |

Storage remains in memory to preserve the original assignment scope. For a real deployment, replace `backend/src/store/items.js` with a database/repository layer.

## Tests

```bash
cd backend
npm test
```

## CI

`.github/workflows/ci.yml` runs backend syntax/tests and the frontend production build on pushes to `main` and pull requests.

## Production next steps

1. Replace in-memory storage with a managed database.
2. Add authentication/authorization if notes become user-owned.
3. Move secrets to the deployment platform's secret manager.
4. Configure a real reverse proxy/TLS and a deployment-specific CORS origin.
5. Add frontend component/E2E tests.
6. Add Sentry alerting and release-health thresholds in the Sentry project.
