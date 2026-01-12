import { Router } from "express";
import { sendOTP } from "../controllers/otp/sendOTP";
import { verifyOTP } from "../controllers/otp/verifyOTP";

const router = Router();

router.post("/otp/send", sendOTP);
router.post("/otp/verify", verifyOTP);

export { router as otpRouter };
