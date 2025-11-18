"use server";
import { apiClient } from "@/lib/axios";

const normalizeIdentifier = (
  identifier: string,
  identifierType: "PHONE" | "EMAIL"
): string => {
  let normalized = identifier.trim();

  if (identifierType === "EMAIL") {
    normalized = normalized.toLowerCase();
  } else if (identifierType === "PHONE") {
    normalized = normalized.replace(/\s+/g, "");
    if (!normalized.startsWith("+")) {
      if (normalized.startsWith("880")) {
        normalized = `+${normalized}`;
      } else if (normalized.startsWith("0")) {
        normalized = `+880${normalized.slice(1)}`;
      } else if (/^1\d{9}$/.test(normalized)) {
        normalized = `+880${normalized}`;
      }
    }
  }

  return normalized;
};

export const resendOtpAction = async ({
  identifier,
  identifierType,
  purpose,
}: {
  identifier: string;
  identifierType: "PHONE" | "EMAIL";
  purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET";
}) => {
  const normalizedIdentifier = normalizeIdentifier(identifier, identifierType);

  try {
    const response = await apiClient.post("/otp/send", {
      identifier: normalizedIdentifier,
      identifierType,
      purpose,
    });

    const { status, data } = response;
    const payload =
      data && typeof data === "object" && "success" in data
        ? data
        : status < 400
        ? { success: true, data }
        : {
            success: false,
            message:
              (data as { message?: string })?.message || "OTP request failed",
          };

    if (!payload.success) {
      return {
        success: false,
        message:
          (payload as { message?: string }).message || "OTP request failed",
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP",
    };
  }
};
