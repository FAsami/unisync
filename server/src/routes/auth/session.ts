import { Router } from "express";
import { generateGuestToken } from "../../controllers/auth/session/generateGuestToken";
import { refreshTokens } from "../../controllers/auth/session/refreshTokens";
import { verifyRefreshToken } from "../../middleware/auth";

const router = Router();

router.post("/guest", generateGuestToken);
router.post("/refresh", verifyRefreshToken, refreshTokens);

export { router as sessionRouter };
