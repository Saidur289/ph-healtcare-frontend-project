import { getPendingEmail } from "@/lib/pendingEmail";
import LoginForm from "@/components/modules/Auth/LoginForm";

interface LoginParams {
  searchParams: Promise<{
    redirect?: string;
    verified?: string;
    reset?: string;
    expired?: string;
    error?: string;
  }>;
}

// short, fixed texts only: never render a raw query param as a message
const OAUTH_ERRORS: Record<string, string> = {
  "no-session-found": "Google login failed. Please try again.",
  "no-user-found": "Google login failed. Please try again.",
  "account-unavailable": "This account is blocked or deleted.",
};

const LoginPage = async ({ searchParams }: LoginParams) => {
  const param = await searchParams;
  const notice =
    param.verified === "1"
      ? "Your email is verified. Please log in."
      : param.reset === "1"
        ? "Your password was reset. Please log in with your new password."
        : param.expired === "1"
          ? "Your session has ended. Please log in again."
          : undefined;
  const error = param.error
    ? (OAUTH_ERRORS[param.error] ?? "Login failed. Please try again.")
    : undefined;
  return (
    <LoginForm
      redirectPath={param.redirect}
      notice={notice}
      initialError={error}
      initialEmail={await getPendingEmail()}
    />
  );
};

export default LoginPage;
