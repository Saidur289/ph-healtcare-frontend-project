// Server-side error tracking for the Next.js app (plan.md 13.10). Off unless SENTRY_DSN is set.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  const { SENTRY_DATA_COLLECTION, scrubEvent } = await import("@/lib/errorScrub");
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    dataCollection: SENTRY_DATA_COLLECTION,
    beforeSend: scrubEvent,
  });
}

// errors thrown while rendering server components / route handlers / server actions
export const onRequestError = Sentry.captureRequestError;
