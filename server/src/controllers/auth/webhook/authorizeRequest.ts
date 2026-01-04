import { Request, Response } from "express";
import { JWTService } from "../../../utils/jwt";
import { asyncHandler } from "../../../utils/response";
import { ActionError } from "../../../utils/errors";
import { DecodedToken } from "../../../types";

const authorizeRequest = asyncHandler(async (req: Request, res: Response) => {
  const hdrs = (req.body && req.body.headers) || {};
  const accessToken = (hdrs["x-hasura-access-token"] ||
    hdrs["X-hasura-access-token"]) as string;
  console.log("==> accessToken", accessToken);
  if (!accessToken) {
    throw new ActionError(
      "Access token is required",
      "UNAUTHORIZED",
      null,
      401
    );
  }

  let decodedToken: DecodedToken;
  try {
    decodedToken = JWTService.verifyAccessToken(accessToken);
  } catch (error) {
    throw new ActionError("Invalid access token", "INVALID_TOKEN", null, 401);
  }

  if (JWTService.isTokenExpired(accessToken)) {
    throw new ActionError(
      "Access token has expired",
      "TOKEN_EXPIRED",
      null,
      401
    );
  }
  console.log("==> decodedToken", decodedToken);

  res.status(200).json({
    "X-Hasura-User-Id": decodedToken.userId || "",
    "X-Hasura-Role": decodedToken.role,
    "X-Hasura-Session-Id": decodedToken.sessionId,
  });
});

export { authorizeRequest };
