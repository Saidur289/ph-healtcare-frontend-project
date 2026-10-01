import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAMES,
  authCookieAttributes,
  pickAuthCookies,
  TParsedCookie,
} from "./setCookieParser";

// NOTE: cookies().set/delete only work in Server Functions (actions) and Route
// Handlers - not while rendering a Server Component. proxy.ts sets cookies itself.

export const setCookie = async (
  name: string,
  value: string,
  maxAgeSeconds?: number,
) => {
  const cookie = await cookies();
  cookie.set(name, value, authCookieAttributes(maxAgeSeconds));
};
export const getCookie = async (name: string) => {
  const cookie = await cookies();
  return cookie.get(name)?.value;
};

export const deleteCookie = async (name: string) => {
  const cookie = await cookies();
  cookie.delete(name);
};

// copy the auth cookies the API just set (login, change password) to this site
export const applyAuthCookies = async (parsed: TParsedCookie[]) => {
  const cookie = await cookies();
  for (const { name, value, maxAge } of pickAuthCookies(parsed)) {
    if (!value || maxAge === 0) {
      cookie.delete(name);
    } else {
      cookie.set(name, value, authCookieAttributes(maxAge));
    }
  }
};

export const clearAuthCookies = async () => {
  const cookie = await cookies();
  AUTH_COOKIE_NAMES.forEach((name) => cookie.delete(name));
};
