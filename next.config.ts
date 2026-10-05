import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// Static security headers. The Content-Security-Policy is set per request in proxy.ts
// (it needs a fresh nonce).
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // camera / microphone / screen sharing are off everywhere except the call page (below)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), display-capture=(), geolocation=(), payment=()" },
  ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  // the end-to-end tests build into their own folder, so they can run next to `next dev`
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // self-hosting without Docker: `npm run build:standalone` -> a small Node server in .next/standalone
  // (Vercel and the e2e tests use the normal build)
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  poweredByHeader: false,
  // dev server: don't print server action arguments (they include passwords, codes and health data)
  logging: { serverFunctions: false },
  images: {
    // public Cloudinary uploads only (photos, specialty icons); private files never reach the browser
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "/*/image/upload/**" }],
  },
  experimental: {
    serverActions: {
      // one upload (photo or report, 5 MB max on the API) plus the form fields
      bodySizeLimit: "6mb",
    },
  },
  async headers() {
    return [
      // every page except the call page (which gets its own Permissions-Policy below)
      { source: "/((?!consultation/room/).*)", headers: securityHeaders },
      // signed medical-file redirects: never pass this URL on as a Referer (later rule wins)
      { source: "/files/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
      {
        // the video call: this page and the Daily.co iframe may use camera and microphone
        source: "/consultation/room/:path*",
        headers: [
          ...securityHeaders.filter((h) => h.key !== "Permissions-Policy"),
          {
            key: "Permissions-Policy",
            value:
              'camera=(self "https://*.daily.co"), microphone=(self "https://*.daily.co"), display-capture=(self "https://*.daily.co"), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
};

// Error tracking: reports go through this app (/monitoring), so the CSP needs no Sentry host and
// ad blockers don't drop them. Source maps are uploaded only when SENTRY_AUTH_TOKEN is set.
export default withSentryConfig(nextConfig, {
  silent: true,
  tunnelRoute: "/monitoring",
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  telemetry: false,
});
