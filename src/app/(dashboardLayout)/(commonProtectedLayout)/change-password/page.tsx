import ChangePasswordForm from "@/components/modules/Auth/ChangePasswordForm";

interface ChangePasswordParams {
  searchParams: Promise<{ required?: string }>;
}
const ChangePasswordPage = async ({ searchParams }: ChangePasswordParams) => {
  const { required } = await searchParams;
  return <ChangePasswordForm required={required === "1"} />;
};

export default ChangePasswordPage;
