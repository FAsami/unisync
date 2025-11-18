import { Router } from "express";
import { sendOTP } from "../controllers/otp/sendOTP";

const router = Router();

router.post("/otp/send", sendOTP);

export { router as otpRouter };
