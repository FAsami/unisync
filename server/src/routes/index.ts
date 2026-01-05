import { Router } from "express";
import { healthRouter } from "./health";
import { authRouter } from "./auth";
import { otpRouter } from "./otp";
import notificationRouter from "./notification";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(otpRouter);
router.use("/notification", notificationRouter);

export { router as routes };
