import { Router } from "express";
import { handleSendNotificationEvent } from "../controllers/events/sendNotification";
import { requireServerSecret } from "../middleware/serverSecret";

const router = Router();

// Only Hasura may deliver events: it sends the SERVER-AUTH-SECRET header.
router.use(requireServerSecret);

// Hasura Event Triggers
router.post("/send-notification", handleSendNotificationEvent);

export { router as eventsRouter };
