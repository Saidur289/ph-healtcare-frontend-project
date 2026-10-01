"use server";
import { clearAuthCookies } from "@/lib/cookieUtils";
import { callAuthApi } from "@/services/auth.service";

// Ends the session on the API and removes the auth cookies from this browser.
// Always succeeds locally, even if the API is unreachable.
export const logoutAction = async () => {
  try {
    await callAuthApi("logout", {}, { withSession: true });
  } catch (error) {
    console.error("Logout request failed:", error);
  }
  await clearAuthCookies();
  return { success: true };
};
