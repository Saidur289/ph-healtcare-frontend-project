// Browser error tracking (plan.md 13.10). Off unless NEXT_PUBLIC_SENTRY_DSN is set.
import * as Sentry from "@sentry/nextjs";
import { SENTRY_DATA_COLLECTION, scrubEvent } from "@/lib/errorScrub";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    // errors only: no performance tracing, no session replay (it would record health data)
    tracesSampleRate: 0,
    dataCollection: SENTRY_DATA_COLLECTION,
    beforeSend: scrubEvent,
    beforeBreadcrumb: (crumb) => (crumb.category === "console" || crumb.category === "ui.input" ? null : crumb),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
