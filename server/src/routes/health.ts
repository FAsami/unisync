import { Router, Request, Response } from "express";
import { ApiResponse } from "../utils";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  const healthData: {
    status: string;
    uptime: number;
    environment: string;
    version: string;
  } = {
    status: "OK",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  };

  const response = ApiResponse.success(
    healthData,
    "Server is healthy",
    200,
    req
  );

  if (req.startTime) {
    response.body.meta.duration = Date.now() - req.startTime;
  }

  res.status(response.statusCode).json(response.body);
});

export { router as healthRouter };
