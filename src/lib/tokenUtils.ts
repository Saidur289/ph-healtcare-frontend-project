import { decode, JwtPayload } from "jsonwebtoken";
import { setCookie } from "./cookieUtils";

const getTokenSecondsRemaining = (token: string) => {
  if (!token) return 0;
  try {
    const tokenPayload = decode(token) as JwtPayload;
    if (tokenPayload && !tokenPayload.exp) return 0;
    const remainingSeconds = (tokenPayload.exp as number) - Date.now() / 1000;
    console.log("Times Remaining: ", remainingSeconds);
    return remainingSeconds > 0 ? remainingSeconds : 0;
  } catch (error) {
    console.log("Error Accessing Token", error);
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
