import { Router } from "express";
import { authorizeRequest } from "../controllers/auth/webhook/authorizeRequest";
import { sessionRouter } from "./auth/session";
import { registerRouter } from "./auth/register";
import { resetPasswordRouter } from "./auth/reset-password";
import { loginRouter } from "./auth/login";
import { logoutRouter } from "./auth/logout";

const router = Router();

// Session routes
router.use("/auth/session", sessionRouter);

// Authentication routes
router.use("/auth/login", loginRouter);
router.use("/auth/logout", logoutRouter);

// Registration routes
router.use("/auth/register", registerRouter);

// Password reset routes
router.use("/auth/reset-password", resetPasswordRouter);

/** Webhook - authorize request used by hasura */
router.post("/auth/webhook/authorize", authorizeRequest);

export { router as authRouter };
