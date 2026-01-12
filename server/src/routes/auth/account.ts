import { Router } from "express";
import { deleteAccount } from "../../controllers/auth/account/delete";

const router = Router();

router.post("/delete", deleteAccount);

export { router as accountRouter };
