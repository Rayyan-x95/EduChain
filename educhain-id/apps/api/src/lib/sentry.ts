import * as Sentry from '@sentry/node';
import { env } from '../config/env';

let initialized = false;

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: env.NODE_ENV,
    release: `educhain-api@${process.env.npm_package_version ?? '0.1.0'}`,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0,
    beforeSend(event) {
      // Scrub sensitive data
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      return event;
    },
  });

  initialized = true;
}

export function captureException(
  error: Error,
  context?: { userId?: string; endpoint?: string; extra?: Record<string, unknown> },
): void {
  if (!initialized) return;

  Sentry.withScope((scope) => {
    if (context?.userId) scope.setUser({ id: context.userId });
    if (context?.endpoint) scope.setTag('endpoint', context.endpoint);
    if (context?.extra) scope.setExtras(context.extra);
    Sentry.captureException(error);
  });
}

export { Sentry };
