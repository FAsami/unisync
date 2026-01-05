import { Router } from "express";
import { healthRouter } from "./health";
import { authRouter } from "./auth";
import { otpRouter } from "./otp";
import notificationRouter from "./notification";
import { eventsRouter } from "./events";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(otpRouter);
router.use("/notification", notificationRouter);
router.use("/webhook/events", eventsRouter);

export { router as routes };
