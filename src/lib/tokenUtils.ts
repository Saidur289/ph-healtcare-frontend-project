"use server";
import jwt, { JwtPayload } from "jsonwebtoken";

import { setCookie } from "./cookieUtils";

const getTokenSecondsRemaining = (token: string) => {
  if (!token) return 0;
  try {
    const tokenPayload = jwt.decode(token) as JwtPayload;
    if (tokenPayload && !tokenPayload.exp) return 0;
    const remainingSeconds =
      (tokenPayload.exp as number) - Math.floor(Date.now() / 1000);

    return remainingSeconds > 0 ? remainingSeconds : 0;
  } catch (error) {
    console.log("Error Accessing Token", error);
    return 0;
  }
};
export const setTokenInCookies = async (
  name: string,
  token: string,
  fallBackMaxAgeSeconds = 24 * 60 * 60, // 1 day
) => {
  let maxInSeconds;
  if (name !== "better-auth.session_token") {
    maxInSeconds = getTokenSecondsRemaining(token);
  }
  await setCookie(name, token, maxInSeconds || fallBackMaxAgeSeconds);
};
export async function isTokenExpiringSoon(
  token: string,
  thresholdInSeconds = 300,
): Promise<boolean> {
  const timesRemaining = getTokenSecondsRemaining(token);
  return timesRemaining > 0 && timesRemaining <= thresholdInSeconds;
}

export async function isTokenExpired(token: string): Promise<boolean> {
  const timesRemaining = getTokenSecondsRemaining(token);
  return timesRemaining === 0;
}
