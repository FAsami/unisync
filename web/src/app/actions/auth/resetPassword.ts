"use server";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { encrypt } from "@/lib/encrypt";

const resetPasswordAction = async ({ phone }: { phone: string }) => {
  const response = await apiClient.post("/auth/reset-password", { phone });
  if (response.data.success) {
    const context = {
      flow: "reset-password",
      identifier: phone,
      identifierType: "PHONE",
      purpose: "PASSWORD_RESET",
      redirectTo: "/login",
    };
    const encrypted = encrypt(JSON.stringify(context));
    redirect(`/forgot-password/verify?ctx=${encodeURIComponent(encrypted)}`);
  } else {
    return {
      success: false,
      message:
        response.data.message ||
        response.data?.error?.message ||
        "Something went wrong!",
    };
  }
};

export { resetPasswordAction };
