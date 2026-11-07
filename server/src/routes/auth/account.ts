import { Router } from "express";
import { deleteAccount } from "../../controllers/auth/account/delete";

import { credentialLimiter } from "../../config/rate-limits";

const router = Router();

router.post("/delete", credentialLimiter, deleteAccount);

export { router as accountRouter };
