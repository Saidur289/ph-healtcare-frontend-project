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
  poweredByHeader: false,
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

export default nextConfig;
