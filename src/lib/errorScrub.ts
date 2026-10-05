// Error reports (Sentry) never carry personal or health data (plan.md 10.8 / 13.10).
import type { ErrorEvent } from "@sentry/nextjs";

type TDataCollection = NonNullable<Parameters<typeof import("@sentry/nextjs").init>[0]>["dataCollection"];

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const KEEP_HEADERS = new Set(["user-agent", "content-type", "x-request-id"]);
const SENSITIVE_KEYS = /pass|token|secret|otp|cookie|authorization|email|phone|contact|address|name|medic|health|instruction|report/i;

const maskEmails = (value: string) => value.replace(EMAIL, "[email]");

const scrub = (value: unknown, depth = 0): unknown => {
  if (depth > 6) return "[…]";
  if (typeof value === "string") return maskEmails(value);
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SENSITIVE_KEYS.test(k) ? "[redacted]" : scrub(v, depth + 1)]),
    );
  }
  return value;
};

export const SENTRY_DATA_COLLECTION: TDataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: { allow: [...KEEP_HEADERS] },
  httpBodies: [],
  urlQueryParams: false,
};

export const scrubEvent = (event: ErrorEvent): ErrorEvent => {
  if (event.request) {
    event.request = {
      method: event.request.method,
      // path only: query strings carry search terms, ids and redirect targets
      url: event.request.url?.split("?")[0],
      headers: Object.fromEntries(Object.entries(event.request.headers ?? {}).filter(([k]) => KEEP_HEADERS.has(k.toLowerCase()))),
    };
  }
  if (event.user) event.user = event.user.id ? { id: String(event.user.id) } : undefined;
  if (event.message) event.message = maskEmails(event.message);
  event.exception?.values?.forEach((ex) => {
    if (ex.value) ex.value = maskEmails(ex.value);
  });
  if (event.extra) event.extra = scrub(event.extra) as ErrorEvent["extra"];
  if (event.contexts) event.contexts = scrub(event.contexts) as ErrorEvent["contexts"];
  event.breadcrumbs = event.breadcrumbs?.map((b) => ({
    ...b,
    // page URLs in navigation breadcrumbs: path only
    message: b.message ? maskEmails(b.message.split("?")[0]) : b.message,
    data: scrub(b.data) as Record<string, unknown>,
  }));
  return event;
};
