import { getPendingEmail } from "@/lib/pendingEmail";
import VerifyEmailForm from "@/components/modules/Auth/VerifyEmailForm";

interface VerifyEmailParams {
  searchParams: Promise<{ sent?: string }>;
}
const VerifyEmailPage = async ({ searchParams }: VerifyEmailParams) => {
  const { sent } = await searchParams;
  const email = await getPendingEmail();
  return <VerifyEmailForm email={email} codeSent={sent === "1"} />;
};

export default VerifyEmailPage;
