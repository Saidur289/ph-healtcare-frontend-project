import "server-only";
import { cookies } from "next/headers";

// The email a sign-up / reset / verify flow is working on. Kept in a short-lived httpOnly
// cookie instead of the URL, so it never lands in browser history, logs or Referer headers.
const NAME = "pending_email";

export const setPendingEmail = async (email: string) =>
  (await cookies()).set(NAME, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 60,
  });

export const getPendingEmail = async () => {
  const value = (await cookies()).get(NAME)?.value;
  return value && value.length <= 254 && value.includes("@") ? value : undefined;
};

export const clearPendingEmail = async () => (await cookies()).delete(NAME);
