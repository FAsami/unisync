import { Router } from "express";
import { sendOTP } from "../controllers/otp/handlers/send";
import { verifyOTP } from "../controllers/otp/handlers/verify";
import { rateLimitOTP } from "../controllers/otp/rateLimit";

const router = Router();

router.post("/otp/send", rateLimitOTP.sendOTPLimit, sendOTP);
router.post("/otp/verify", rateLimitOTP.verifyOTPLimit, verifyOTP);

export { router as otpRouter };
