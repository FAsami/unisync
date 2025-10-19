import { Router } from "express";
import { healthRouter } from "./health";
import { authRouter } from "./auth";
import { otpRouter } from "./otp";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(otpRouter);

export { router as routes };
