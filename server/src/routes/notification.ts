import { Router } from "express";
import { sendNotification } from "../controllers/notification";
import { requireServerSecret } from "../middleware/serverSecret";

const router = Router();

// POST /notification/send - push to arbitrary users. Trusted backends only:
// end users send notifications by inserting into notification_log via Hasura.
router.post("/send", requireServerSecret, sendNotification);

export default router;
