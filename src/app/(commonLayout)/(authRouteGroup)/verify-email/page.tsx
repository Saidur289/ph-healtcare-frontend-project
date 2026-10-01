import VerifyEmailForm from "@/components/modules/Auth/VerifyEmailForm";

interface VerifyEmailParams {
  searchParams: Promise<{ email?: string; sent?: string }>;
}
const VerifyEmailPage = async ({ searchParams }: VerifyEmailParams) => {
  const { email, sent } = await searchParams;
  return <VerifyEmailForm email={email} codeSent={sent === "1"} />;
};

export default VerifyEmailPage;
