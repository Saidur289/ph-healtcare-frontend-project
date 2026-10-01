// Server-side helpers for the /auth API. Not a "use server" module: nothing here
// should be callable from the browser directly (the page actions call these).
import { cache } from "react";
import { cookies } from "next/headers";
import { UserInfo } from "@/types/user.types";
import {
  parseSetCookieHeaders,
  TParsedCookie,
} from "@/lib/setCookieParser";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined");
}

const getCookieHeader = async () => {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
};

export type TAuthApiResult<TData = unknown> = {
  ok: boolean;
  status: number;
  message: string;
  data?: TData;
  setCookies: TParsedCookie[];
};

// POST /auth/<path>. withSession forwards this browser's cookies (logout, change password).
export const callAuthApi = async <TData = unknown>(
  path: string,
  body: unknown,
  options: { withSession?: boolean } = {},
): Promise<TAuthApiResult<TData>> => {
  const res = await fetch(`${API_BASE_URL}/auth/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.withSession ? { Cookie: await getCookieHeader() } : {}),
    },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: res.status,
    message: json?.message || (res.ok ? "Success" : "Something went wrong"),
    data: json?.data,
    setCookies: parseSetCookieHeaders(res.headers.getSetCookie()),
  };
};

// The logged-in user (or null). cache(): the layout, sidebar and navbar all call
// this during one request, but /auth/me is fetched only once.
export const getUserInfo = cache(async (): Promise<UserInfo | null> => {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get("accessToken") || !cookieStore.get("better-auth.session_token")) {
      return null;
    }
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: await getCookieHeader(),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data.data ?? null;
  } catch (error) {
    console.error("Error in get user info", error);
    return null;
  }
});
