import ResetPasswordForm from "@/components/modules/Auth/ResetPasswordForm";

interface ResetPasswordParams {
  searchParams: Promise<{ email?: string }>;
}
const ResetPasswordPage = async ({ searchParams }: ResetPasswordParams) => {
  const { email } = await searchParams;
  return <ResetPasswordForm email={email} />;
};

export default ResetPasswordPage;
