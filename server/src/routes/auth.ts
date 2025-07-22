import { Router } from "express";
import { generateGuestToken } from "../controllers/auth/generateGuestToken";
import { refreshTokens } from "../controllers/auth/refreshTokens";
import authorizeRequestWebhook from "..//controllers/auth/authorizeRequestWebhook";
import { verifyRefreshToken } from "../middleware/auth";

const router = Router();

router.post("/auth/guest-session", generateGuestToken);
router.post("/auth/refresh", verifyRefreshToken, refreshTokens);
router.post("/auth/webhook/authorize", authorizeRequestWebhook);

export { router as authRouter };
