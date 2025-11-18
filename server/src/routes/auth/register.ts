import { Router } from "express";
import { register } from "../../controllers/auth/register/register";
import { verifyRegistration } from "../../controllers/auth/register/verifyRegistration";

const router = Router();

router.post("/", register);
router.post("/verify", verifyRegistration);

export { router as registerRouter };
