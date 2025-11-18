import { redirect } from "next/navigation";
import { VerifyContext } from "@/lib/verifyContext";
import AuthLayout from "@/components/AuthLayout";
import ForgotPasswordVerifyForm from "./ForgotPasswordVerifyForm";
import { decrypt } from "@/lib/encrypt";

type Props = {
  searchParams: Promise<{ ctx?: string }>;
};

export default async function ForgotPasswordVerifyPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const ctx = params.ctx;
  let context: VerifyContext | null = null;
  if (ctx) {
    const result = decrypt(decodeURIComponent(ctx));
    if (result) {
      context = JSON.parse(result) as VerifyContext;
    }
  }
  if (!context) {
    redirect("/forgot-password");
  }
  const channel = context.identifierType === "EMAIL" ? "email" : "phone";
  const subtitle = (
    <>
      We've sent an OTP to your{" "}
      <span className='font-medium text-gray-900'>{context.identifier}</span>{" "}
      {channel}. Then choose a new password.
    </>
  );

  return (
    <AuthLayout title='Reset your password' subtitle={subtitle}>
      <ForgotPasswordVerifyForm context={context} />
    </AuthLayout>
  );
}
