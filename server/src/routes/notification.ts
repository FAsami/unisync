import { Router } from "express";
import { sendNotification } from "@/controllers/notification";

const router = Router();

// POST /notification/send - Send notification to users (admin only)
router.post("/send", sendNotification);

export default router;
