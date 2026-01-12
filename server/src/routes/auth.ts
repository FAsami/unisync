import { Router } from "express";
import { authorizeRequest } from "../controllers/auth/webhook/authorizeRequest";
import { sessionRouter } from "./auth/session";
import { registerRouter } from "./auth/register";
import { resetPasswordRouter } from "./auth/reset-password";
import { loginRouter } from "./auth/login";
import { logoutRouter } from "./auth/logout";
import { accountRouter } from "./auth/account";

const router = Router();

router.use("/auth/session", sessionRouter);
router.use("/auth/login", loginRouter);
router.use("/auth/logout", logoutRouter);
router.use("/auth/register", registerRouter);
router.use("/auth/reset-password", resetPasswordRouter);
router.use("/auth/account", accountRouter);

router.post("/auth/webhook/authorize", authorizeRequest);

export { router as authRouter };
