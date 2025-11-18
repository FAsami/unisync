import { redirect } from "next/navigation";
import { VerifyContext } from "@/lib/verifyContext";
import AuthLayout from "@/components/AuthLayout";
import RegisterVerifyForm from "./RegisterVerifyForm";
import { decrypt } from "@/lib/encrypt";

type Props = {
  searchParams: Promise<{ ctx?: string }>;
};

export default async function RegisterVerifyPage({ searchParams }: Props) {
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
    redirect("/register");
  }
  const channel = context.identifierType === "EMAIL" ? "email" : "phone";
  const subtitle = (
    <>
      We've sent an OTP to your{" "}
      <span className='font-medium text-gray-900'>{context.identifier}</span>{" "}
      {channel}. Please verify to complete your registration.
    </>
  );

  return (
    <AuthLayout title='Verify your account' subtitle={subtitle}>
      <RegisterVerifyForm context={context} />
    </AuthLayout>
  );
}
