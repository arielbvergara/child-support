import * as Sentry from '@sentry/node';
import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRouter from './routes/health';
import { createContactRouter } from './routes/contact';
import { createAppointmentRouter } from './routes/appointment';
import { CONTACT_RATE_LIMIT_MAX, CONTACT_RATE_LIMIT_WINDOW_MS, CONTACT_ROUTE_PATH } from './constants/contact.constants';
import { APPOINTMENT_ROUTE_PATH } from './constants/appointment.constants';

/**
 * Factory that creates and fully configures the Express application.
 *
 * Accepts an optional `configureRoutes` callback that is invoked after all
 * standard routes are registered but *before* error-handling middleware is
 * attached. This lets tests inject additional routes into the correct position
 * in the middleware stack so thrown errors are processed by the Sentry handler
 * and the generic error handler.
 */
export function createApp(configureRoutes?: (app: Application) => void): Application {
  const app: Application = express();

  // Trust the first hop from a reverse proxy/load balancer so that
  // express-rate-limit resolves the real client IP from X-Forwarded-For
  // rather than the proxy address, preventing all clients sharing one bucket.
  app.set('trust proxy', 1);

  const allowedOriginsRaw = process.env.ALLOWED_ORIGINS ?? '';
  if (!allowedOriginsRaw && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: ALLOWED_ORIGINS is not configured. The application cannot start in production without allowed origins.');
  }
  if (!allowedOriginsRaw && process.env.NODE_ENV !== 'test') {
    console.warn('ALLOWED_ORIGINS is not set. All CORS requests will be blocked.');
  }

  const allowedOrigins = allowedOriginsRaw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(helmet());

  app.use(
    cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
    }),
  );

  app.use(express.json());
  app.use('/health', healthRouter);

  const contactRateLimit = rateLimit({
    windowMs: CONTACT_RATE_LIMIT_WINDOW_MS,
    max: CONTACT_RATE_LIMIT_MAX,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
  });

  app.use(CONTACT_ROUTE_PATH, contactRateLimit);
  app.use(CONTACT_ROUTE_PATH, createContactRouter());

  // The appointment booking rate limiter is applied only to POST /appointments
  // (inside the router) so that GET /appointments/availability — called on every
  // page load — is never throttled.
  app.use(APPOINTMENT_ROUTE_PATH, createAppointmentRouter());

  // Allow callers (e.g. tests) to register additional routes before error
  // handlers so thrown errors flow through the full error-handling pipeline.
  if (configureRoutes) {
    configureRoutes(app);
  }

  // Sentry error handler must be registered after all routes and before any
  // other error-handling middleware so it can capture unhandled errors.
  Sentry.setupExpressErrorHandler(app);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err.message);
    const isDev = process.env.NODE_ENV === 'development';
    res.status(500).json({
      error: isDev ? err.message : 'Internal Server Error',
    });
  });

  return app;
}

export default createApp();
