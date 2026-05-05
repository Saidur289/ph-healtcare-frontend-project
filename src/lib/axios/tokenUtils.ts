import jwt, { decode, JwtPayload } from "jsonwebtoken";
import { setCookie } from "./cookieUtils";
const JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN;
const getTokenSecondsRemaining = (token: string) => {
  if (!token) return 0;
  try {
    const tokenPayload = JWT_ACCESS_TOKEN
      ? (jwt.verify(token, JWT_ACCESS_TOKEN as string) as JwtPayload)
      : (decode(token) as JwtPayload);
    if (tokenPayload && !tokenPayload.exp) return 0;
    const remainingSeconds = (tokenPayload.exp as number) - Date.now() / 1000;
    return remainingSeconds > 0 ? remainingSeconds : 0;
  } catch (error) {
    console.log("Error Accessing Token", error);
  }
};
export const setTokenInCookies = async (
  name: string,
  token: string,
  fallBackMaxAgeSeconds = 60 * 60 * 24,
) => {
  const maxAgeInSeconds = getTokenSecondsRemaining(token);
  await setCookie(name, token, maxAgeInSeconds || fallBackMaxAgeSeconds);
};
