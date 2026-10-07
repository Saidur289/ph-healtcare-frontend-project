// End of Google sign-in. The API (on another domain) can't set cookies for this site, so it sends
// the browser here with a single-use, 60-second code. We exchange it server to server and set the
// auth cookies on this domain, exactly like the email/password login does.
import { getDefaultDashboardRoute, isValidateRedirect, UserRole } from "@/lib/authUtils";
import { applyAuthCookies } from "@/lib/cookieUtils";
import { callAuthApi } from "@/services/auth.service";
import { ILoginResponse } from "@/types/auth.types";
import { NextRequest, NextResponse } from "next/server";

const CODE = /^[A-Za-z0-9_-]{43}$/;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? "";
  const redirectPath = request.nextUrl.searchParams.get("redirect") ?? "";
  const toLogin = (error: string) => NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  if (!CODE.test(code)) return toLogin("no-session-found");

  let result;
  try {
    result = await callAuthApi<ILoginResponse>("google/exchange", { code });
  } catch (error) {
    console.error("Google code exchange failed:", error);
    return toLogin("no-session-found");
  }
  if (!result.ok || !result.data?.user) {
    return toLogin(result.status === 403 ? "account-unavailable" : "no-session-found");
  }

  await applyAuthCookies(result.setCookies);
  const { role, needPasswordChange } = result.data.user;
  const target = needPasswordChange
    ? "/change-password?required=1"
    : redirectPath && isValidateRedirect(redirectPath, role as UserRole)
      ? redirectPath
      : getDefaultDashboardRoute(role as UserRole);
  // the code must not stay in the history or reach analytics via Referer
  const response = NextResponse.redirect(new URL(target, request.url));
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "no-store");
  return response;
}
