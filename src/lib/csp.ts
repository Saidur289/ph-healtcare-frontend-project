// Content-Security-Policy, built per request in proxy.ts with a fresh nonce.
// Scripts: only Next.js' own (nonce + strict-dynamic). Styles keep 'unsafe-inline' because
// the toast and UI libraries inject <style> tags at runtime.
// Allowed third parties: Cloudinary (photos / reports), Daily.co (video iframe).
// Stripe Checkout and Google sign-in are full-page redirects, so they need no entry.
export const buildCsp = (nonce: string) => {
  const isDev = process.env.NODE_ENV === "development";
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
    "font-src": ["'self'", "data:"],
    // server actions and RSC fetches are same-origin; dev needs the HMR websocket
    "connect-src": ["'self'", ...(isDev ? ["ws:", "wss:"] : [])],
    "frame-src": ["https://*.daily.co"],
    "media-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const policy = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
};

export const createNonce = () => Buffer.from(crypto.randomUUID()).toString("base64");
