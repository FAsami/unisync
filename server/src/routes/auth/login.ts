import { Router } from "express";
import { login } from "../../controllers/auth/login";

const router = Router();

router.post("/", login);

export { router as loginRouter };
