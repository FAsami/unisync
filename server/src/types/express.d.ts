/**
 * Express Type Augmentations
 * Extends Express types with custom properties
 */

import { DecodedToken } from "./auth.types";
import { RateLimitData } from "./otp.types";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
      requestId?: string;
      startTime?: number;
      rateLimitData?: RateLimitData;
    }

    interface Response {
      /**
       * Send success response with data
       * @param message - Success message
       * @param data - Response data
       */
      success<T>(message: string, data?: T): void;

      /**
       * Send error response
       * @param message - Error message
       * @param statusCode - HTTP status code
       * @param code - Error code
       * @param details - Additional error details
       * @param type - Response type (ACTION_ERROR for Hasura actions, API_ERROR for REST)
       */
      error(
        message: string,
        statusCode?: number,
        code?: string,
        details?: any,
        type?: "ACTION_ERROR" | "API_ERROR"
      ): void;
    }
  }
}

export {};
