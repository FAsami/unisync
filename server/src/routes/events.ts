import { Router } from "express";
import { handleSendNotificationEvent } from "../controllers/events/sendNotification";

const router = Router();

// Hasura Event Triggers
router.post("/send-notification", handleSendNotificationEvent);

export { router as eventsRouter };
