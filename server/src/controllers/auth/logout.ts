import { Request, Response } from "express";
import { getGraphQLClient } from "../../lib/graphqlClient";
import { UPDATE_SESSION } from "./gql/mutation";
import { JWTService } from "../../utils/jwt";
import { asyncHandler } from "../../utils/response";
import { UnauthorizedError } from "../../utils/errors";

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authorization header required");
  }

  const token = auth.replace("Bearer ", "");
  const decoded = JWTService.verifyAccessToken(token);
  const graphql = getGraphQLClient();

  await graphql.request(UPDATE_SESSION, {
    id: decoded.sessionId,
    session: { revoked: true, last_used_at: new Date().toISOString() },
  });

  res.message("Logged out successfully");
});
