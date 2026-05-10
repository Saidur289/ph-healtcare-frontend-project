"use server";

import { setTokenInCookies } from "@/lib/tokenUtils";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined");
}
export async function getNewTokenWithRefreshToken(
  refreshToken: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    if (!res.ok) throw new Error("Failed to refresh token");
    const data = await res.json();
    const { accessToken, refreshToken: newRefreshToken, token } = data;
    if (accessToken) {
      await setTokenInCookies("accessToken", accessToken);
    }
    if (newRefreshToken) {
      await setTokenInCookies("refreshToken", newRefreshToken);
    }
    if (token) {
      await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day
    }
    return true;
  } catch (error) {
    console.log("Error in get refreshToken", error);
    return false;
  }
}
export async function getUserInfo() {
  try {
    const cookie = await cookies();
    const accessToken = cookie.get("accessToken")?.value;
    const sessionToken = cookie.get("better-auth.session_token")?.value;
    if (!accessToken) return null;
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
      },
    });
    if (!res.ok) {
      console.log("Failed to get user info");
      return null;
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.log("Error in get user info", error);
    return null;
  }
}
