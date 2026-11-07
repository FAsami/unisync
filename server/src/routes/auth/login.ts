import { Router } from "express";
import { login } from "../../controllers/auth/login";
import { credentialLimiter } from "../../config/rate-limits";

const router = Router();

router.post("/", credentialLimiter, login);

export { router as loginRouter };
