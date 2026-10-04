import { getPendingEmail } from "@/lib/pendingEmail";
import ResetPasswordForm from "@/components/modules/Auth/ResetPasswordForm";

interface ResetPasswordParams {
  searchParams: Promise<Record<string, string | undefined>>;
}
const ResetPasswordPage = async ({ searchParams }: ResetPasswordParams) => {
  await searchParams;
  const email = await getPendingEmail();
  return <ResetPasswordForm email={email} />;
};

export default ResetPasswordPage;
