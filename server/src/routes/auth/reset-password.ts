import { Router } from "express";
import { resetPasswordRequest } from "../../controllers/auth/reset-password/resetPasswordRequest";
import { resetPasswordVerify } from "../../controllers/auth/reset-password/resetPasswordVerify";

import { credentialLimiter } from "../../config/rate-limits";

const router = Router();

router.post("/", resetPasswordRequest);
router.post("/verify", credentialLimiter, resetPasswordVerify);

export { router as resetPasswordRouter };
