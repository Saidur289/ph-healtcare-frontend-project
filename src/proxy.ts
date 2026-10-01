import { NextRequest, NextResponse } from "next/server";
import { JwtPayload } from "jsonwebtoken";
import JwtUtils from "./lib/jwtUtils";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoutes,
  UserRole,
} from "./lib/authUtils";
import { isTokenExpiringSoon } from "./lib/tokenUtils";
import {
  AUTH_COOKIE_NAMES,
  authCookieAttributes,
  parseSetCookieHeaders,
  pickAuthCookies,
  TParsedCookie,
} from "./lib/setCookieParser";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

type TRefreshResult =
  | { status: "refreshed"; cookies: TParsedCookie[] }
  | { status: "rejected" } // session is gone: log the user out
  | { status: "unavailable" }; // API down: keep the current cookies

// Calls the API refresh endpoint. Cookies can't be set with cookies() here, so the
// new values are returned and written onto the proxy response below.
const refreshTokens = async (
  refreshToken: string,
  sessionToken: string,
): Promise<TRefreshResult> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}; better-auth.session_token=${sessionToken}`,
      },
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) return { status: "rejected" };
    if (!res.ok) return { status: "unavailable" };
    const cookies = pickAuthCookies(parseSetCookieHeaders(res.headers.getSetCookie()));
    return cookies.some((c) => c.name === "accessToken" && c.value)
      ? { status: "refreshed", cookies }
      : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
};

const verifyAccessToken = (token?: string): JwtPayload | null => {
  if (!token) return null;
  const result = JwtUtils.verifyToken(token, ACCESS_TOKEN_SECRET);
  return result.success && result.data ? result.data : null;
};

const loginRedirect = (request: NextRequest) => {
  const loginUrl = new URL("/login", request.url);
  const { pathname, search } = request.nextUrl;
  loginUrl.searchParams.set("redirect", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const routeOwner = getRouteOwner(pathname);
  const isProtected = routeOwner !== null;

  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  let refreshedCookies: TParsedCookie[] = [];
  let clearCookies = false;

  try {
    // 1. refresh once when the access token is missing/expired or about to expire
    let payload = verifyAccessToken(accessToken);
    const needsRefresh =
      Boolean(refreshToken && sessionToken) &&
      (!payload || isTokenExpiringSoon(accessToken as string));
    if (needsRefresh) {
      const result = await refreshTokens(refreshToken as string, sessionToken as string);
      if (result.status === "refreshed") {
        refreshedCookies = result.cookies;
        accessToken = result.cookies.find((c) => c.name === "accessToken")?.value;
        payload = verifyAccessToken(accessToken);
      } else if (result.status === "rejected") {
        clearCookies = true;
        payload = null;
      }
    } else if (!payload && (accessToken || sessionToken)) {
      // leftover cookies that can't be refreshed
      clearCookies = true;
    }

    const isLoggedIn = Boolean(payload);
    const role = (payload?.role === "SUPER_ADMIN" ? "ADMIN" : payload?.role) as
      | UserRole
      | undefined;
    const dashboard = isLoggedIn ? getDefaultDashboardRoute(role as UserRole) : "/";

    let response: NextResponse;
    if (isLoggedIn && isAuthRoutes(pathname)) {
      // 2. logged-in users don't need /login, /register, /forgot-password
      response = NextResponse.redirect(new URL(dashboard, request.url));
    } else if (!isProtected) {
      // 3. public pages (incl. /verify-email and /reset-password)
      response = NextResponse.next();
    } else if (!isLoggedIn) {
      // 4. protected page without a valid session
      response = loginRedirect(request);
    } else if (payload?.needPasswordChange && pathname !== "/change-password") {
      // 5. accounts created by an admin must set their own password first
      response = NextResponse.redirect(new URL("/change-password?required=1", request.url));
    } else if (routeOwner !== "COMMON" && routeOwner !== role) {
      // 6. role check runs on EVERY protected request
      response = NextResponse.redirect(new URL(dashboard, request.url));
    } else {
      response = NextResponse.next();
    }

    // 7. pass fresh cookies to this request's server code AND to the browser
    if (refreshedCookies.length > 0) {
      if (response.headers.get("x-middleware-next") === "1") {
        const forwarded = new Map(request.cookies.getAll().map((c) => [c.name, c.value]));
        refreshedCookies.forEach((c) => forwarded.set(c.name, c.value));
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set(
          "cookie",
          Array.from(forwarded, ([name, value]) => `${name}=${value}`).join("; "),
        );
        response = NextResponse.next({ request: { headers: requestHeaders } });
      }
      refreshedCookies.forEach(({ name, value, maxAge }) =>
        response.cookies.set(name, value, authCookieAttributes(maxAge)),
      );
    } else if (clearCookies) {
      AUTH_COOKIE_NAMES.forEach((name) => response.cookies.delete(name));
    }
    return response;
  } catch (error) {
    console.error("Error in proxy:", error);
    // fail closed: never let an error open a protected page
    return isProtected ? loginRedirect(request) : NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
