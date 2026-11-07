import { Request, Response } from "express";
import { verifyOTPSchema } from "../../schemas";
import { checkAndConsumeOTP } from "./utils";
import logger from "../../config/logger";
import { asyncHandler } from "../../utils/response";

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const parsed = verifyOTPSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.error(
      parsed.error.issues[0]?.message || "Invalid input",
      400,
      "VALIDATION_ERROR",
      parsed.error.issues,
      "ACTION_ERROR"
    );
  }

  const { identifier, otp, purpose } = parsed.data;
  const result = await checkAndConsumeOTP({ identifier, purpose, otp });

  if (!result.ok) {
    return res.error(
      result.message,
      400,
      result.code,
      result.attemptsRemaining !== undefined
        ? { attemptsRemaining: result.attemptsRemaining }
        : null,
      "ACTION_ERROR"
    );
  }

  logger.info("OTP verified successfully", { purpose });

  res.success("OTP verified successfully", {
    verified: true,
    otpId: result.otpId,
  });
});
