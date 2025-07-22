import { Router } from "express";
import { generateGuestToken } from "../controllers/auth/generateGuestToken";
import authorizeRequestWebhook from "..//controllers/auth/authorizeRequestWebhook";

const router = Router();

router.post("/auth/guest-session", generateGuestToken);
router.post("/auth/webhook/authorize", authorizeRequestWebhook);

export { router as authRouter };
