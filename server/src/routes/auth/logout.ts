import { Router } from "express";
import { logout } from "../../controllers/auth/logout";

const router = Router();

router.post("/", logout);

export { router as logoutRouter };
