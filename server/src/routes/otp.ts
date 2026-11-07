import { Router } from "express";
import { sendOTP } from "../controllers/otp/sendOTP";
import { verifyOTP } from "../controllers/otp/verifyOTP";
import { sendOTPLimit, credentialLimiter } from "../config/rate-limits";

const router = Router();

// sendOTPLimit enforces per-identifier and per-IP hourly quotas (stored in
// Hasura) and populates req.rateLimitData, which sendOTP needs to record usage.
router.post("/otp/send", sendOTPLimit, sendOTP);
router.post("/otp/verify", credentialLimiter, verifyOTP);

export { router as otpRouter };
