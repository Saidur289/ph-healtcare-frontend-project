// Parses "Set-Cookie" headers coming back from the API, e.g.
// "accessToken=abc; Max-Age=900; Path=/; Expires=...; HttpOnly; SameSite=Lax"
// The API sets the auth cookies on its own response; the Next.js server copies them
// onto the browser's cookies for this site (see lib/cookieUtils.ts and proxy.ts).

export const AUTH_COOKIE_NAMES = [
  "accessToken",
  "refreshToken",
  "better-auth.session_token",
] as const;

export type TParsedCookie = {
  name: string;
  value: string;
  // seconds; undefined = session cookie
  maxAge?: number;
};

export const parseSetCookieHeaders = (headers: string[]): TParsedCookie[] => {
  const parsed: TParsedCookie[] = [];
  for (const header of headers) {
    const [pair, ...attributes] = header.split(";");
    const separator = pair.indexOf("=");
    if (separator <= 0) continue;
    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();

    let maxAge: number | undefined;
    for (const attribute of attributes) {
      const [key, attrValue] = attribute.split("=").map((part) => part?.trim());
      if (key?.toLowerCase() === "max-age" && attrValue) {
        maxAge = Number(attrValue);
      } else if (key?.toLowerCase() === "expires" && attrValue && maxAge === undefined) {
        const expiresAt = Date.parse(attrValue);
        if (!Number.isNaN(expiresAt)) {
          maxAge = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
        }
      }
    }
    parsed.push({ name, value, maxAge });
  }
  return parsed;
};

// only the auth cookies are ever copied from the API
export const pickAuthCookies = (cookies: TParsedCookie[]) =>
  cookies.filter((cookie) =>
    (AUTH_COOKIE_NAMES as readonly string[]).includes(cookie.name),
  );

// same flags everywhere on the Next.js side
export const authCookieAttributes = (maxAge?: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // "lax": not sent on cross-site POSTs (CSRF), still sent on normal link clicks
  sameSite: "lax" as const,
  path: "/",
  ...(maxAge !== undefined ? { maxAge } : {}),
});
