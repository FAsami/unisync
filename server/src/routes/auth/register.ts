import { Router } from "express";
import { register } from "../../controllers/auth/register/register";
import { verifyRegistration } from "../../controllers/auth/register/verifyRegistration";

import { credentialLimiter } from "../../config/rate-limits";

const router = Router();

router.post("/", register);
router.post("/verify", credentialLimiter, verifyRegistration);

export { router as registerRouter };
