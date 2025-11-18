import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils";
import { config } from "../config/environment";

const router = Router();

router.get(
  "/health",
  asyncHandler(async (req: Request, res: Response) => {
    return res.success("Server is healthy", {
      status: "OK",
      uptime: process.uptime(),
      environment: config.NODE_ENV,
      version: config.APP_VERSION,
    });
  })
);

export { router as healthRouter };
