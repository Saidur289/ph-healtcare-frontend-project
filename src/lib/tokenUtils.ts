// Not a "use server" module on purpose: these helpers must not become public
// server actions. They are only imported by server code (proxy.ts).
import jwt, { JwtPayload } from "jsonwebtoken";

export const getTokenSecondsRemaining = (token: string) => {
  if (!token) return 0;
  try {
    const tokenPayload = jwt.decode(token) as JwtPayload | null;
    if (!tokenPayload?.exp) return 0;
    const remainingSeconds = tokenPayload.exp - Math.floor(Date.now() / 1000);
    return remainingSeconds > 0 ? remainingSeconds : 0;
  } catch {
    return 0;
  }
};

export const isTokenExpiringSoon = (token: string, thresholdInSeconds = 120) => {
  const timesRemaining = getTokenSecondsRemaining(token);
  return timesRemaining > 0 && timesRemaining <= thresholdInSeconds;
};

export const isTokenExpired = (token: string) =>
  getTokenSecondsRemaining(token) === 0;
