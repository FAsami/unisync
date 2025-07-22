import { Request, Response } from "express";
import { JWTService, DecodedToken } from "../../utils/jwt";
import { AppError } from "../../utils/response/AppError";

const authorizeRequestWebhook = (req: Request, res: Response) => {
  console.log("req.box", req.body);
  try {
    const accessToken = req.body.headers["X-hasura-access-token"] as string;
    console.log("accesss token", req.body.headers);
    if (!accessToken) {
      throw new AppError("Access token is required", 401);
    }

    const decodedToken: DecodedToken =
      JWTService.verifyAccessToken(accessToken);
    if (JWTService.isTokenExpired(accessToken)) {
      throw new AppError("Access token has expired", 401);
    }

    res.status(200).json({
      "X-Hasura-User-Id": decodedToken.userId || "",
      "X-Hasura-Role": decodedToken.role,
      "X-Hasura-Session-Id": decodedToken.sessionId,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: error.message,
      });
    } else {
      console.error("Webhook authorization error:", error);
      res.status(500).json({
        error: "Internal server error during authorization",
      });
    }
  }
};

export default authorizeRequestWebhook;
