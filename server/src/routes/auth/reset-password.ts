import { Router } from "express";
import { resetPasswordRequest } from "../../controllers/auth/reset-password/resetPasswordRequest";
import { resetPasswordVerify } from "../../controllers/auth/reset-password/resetPasswordVerify";

const router = Router();

router.post("/", resetPasswordRequest);
router.post("/verify", resetPasswordVerify);

export { router as resetPasswordRouter };
