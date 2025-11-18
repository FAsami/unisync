import { Response } from "express";
import { ApiResponseData, PaginatedResponse } from "../../types";

/**
 * Simplified API Response Helper
 *
 * No need to pass `req` - it's automatically extracted from `res.req`
 * Arguments are reordered for better readability:
 * - Message comes first (most important)
 * - Data comes last (often optional)
 *
 * @example
 * // Success (200)
 * ApiResponse.send(res, "Login successful", { token: "..." });
 *
 * // Created (201)
 * ApiResponse.sendCreated(res, "User created", { id: "123" });
 *
 * // Error (400)
 * ApiResponse.sendError(res, "Invalid input", 400, "VALIDATION_ERROR");
 *
 * // Message only
 * ApiResponse.sendMessage(res, "OTP sent successfully");
 */
export class ApiResponse {
  /**
   * Helper to extract request from response
   */
  private static getReq(res: Response): any {
    return (res as any).req || res;
  }

  /**
   * Build success response metadata
   */
  private static buildMeta(res: Response): ApiResponseData["meta"] {
    const req = this.getReq(res);
    return {
      timestamp: new Date().toISOString(),
      path: req?.originalUrl || req?.url || "/api/v1",
      method: req?.method || "GET",
      requestId: req?.headers?.["x-request-id"] || undefined,
    };
  }

  // ===== MAIN RESPONSE METHODS =====

  /**
   * Send success response (default 200)
   * @param res - Express response object
   * @param message - Success message
   * @param data - Response data (optional)
   * @param statusCode - HTTP status code (default: 200)
   */
  static send<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data: data ?? null,
      meta: this.buildMeta(res),
    });
  }

  /**
   * Send created response (201)
   * @param res - Express response object
   * @param message - Success message
   * @param data - Created resource data
   */
  static sendCreated<T>(res: Response, message: string, data: T): void {
    this.send(res, message, data, 201);
  }

  /**
   * Send error response
   * @param res - Express response object
   * @param message - Error message
   * @param statusCode - HTTP status code (default: 500)
   * @param code - Error code (e.g., "VALIDATION_ERROR")
   * @param details - Additional error details
   * @param type - Response type for Hasura actions vs regular API
   */
  static sendError(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any,
    type: "ACTION_ERROR" | "API_ERROR" = "API_ERROR"
  ): void {
    const req = this.getReq(res);

    // For Hasura actions, return simplified format with extensions
    if (type === "ACTION_ERROR") {
      res.status(statusCode).json({
        message,
        extensions: {
          code,
          details,
          timestamp: new Date().toISOString(),
          path: req?.originalUrl || req?.url || "/api/v1",
        },
      });
      return;
    }

    // For regular API errors, return full structured format
    res.status(statusCode).json({
      success: false,
      data: null,
      error: {
        message,
        code,
        details,
      },
      meta: this.buildMeta(res),
    });
  }

  /**
   * Send message-only response (no data)
   * @param res - Express response object
   * @param message - Message to send
   * @param statusCode - HTTP status code (default: 200)
   */
  static sendMessage(
    res: Response,
    message: string,
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data: null,
      meta: this.buildMeta(res),
    });
  }

  /**
   * Send paginated response
   * @param res - Express response object
   * @param message - Success message
   * @param data - Array of items
   * @param page - Current page number
   * @param limit - Items per page
   * @param total - Total number of items
   */
  static sendPaginated<T>(
    res: Response,
    message: string,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): void {
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        ...this.buildMeta(res),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }

  /**
   * Send no content response (204)
   * @param res - Express response object
   */
  static sendNoContent(res: Response): void {
    res.status(204).send();
  }

  // ===== LEGACY METHODS (for backward compatibility) =====
  // These will be deprecated in favor of the simpler methods above

  /**
   * @deprecated Use `send()` instead
   */
  static sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    this.send(res, message || "Success", data, statusCode);
  }

  /**
   * @deprecated Use `buildMeta()` for internal use only
   */
  static success<T>(
    data: T,
    message?: string,
    statusCode: number = 200,
    req?: any
  ): { statusCode: number; body: ApiResponseData<T> } {
    return {
      statusCode,
      body: {
        success: true,
        data,
        message,
        meta: {
          timestamp: new Date().toISOString(),
          path: req?.originalUrl || "/api/v1",
          method: req?.method || "GET",
          requestId: req?.headers?.["x-request-id"] || undefined,
        },
      },
    };
  }

  /**
   * @deprecated Use `send()` with statusCode 201 or `sendCreated()` instead
   */
  static created<T>(
    data: T,
    message?: string,
    req?: any
  ): { statusCode: number; body: ApiResponseData<T> } {
    return this.success(data, message, 201, req);
  }

  /**
   * @deprecated Use `sendError()` instead
   */
  static error(
    message: string,
    statusCode: number = 500,
    code?: string,
    req?: any,
    details?: any,
    type: "ACTION_ERROR" | "API_ERROR" = "API_ERROR"
  ): { statusCode: number; body: any } {
    if (type === "ACTION_ERROR") {
      return {
        statusCode,
        body: {
          message,
          extensions: {
            code,
            details,
            timestamp: new Date().toISOString(),
            path: req?.originalUrl || "/api/v1",
          },
        },
      };
    }

    return {
      statusCode,
      body: {
        success: false,
        data: null,
        error: {
          message,
          code,
          details,
        },
        meta: {
          timestamp: new Date().toISOString(),
          path: req?.originalUrl || "/api/v1",
          method: req?.method || "GET",
          requestId: req?.headers?.["x-request-id"] || undefined,
        },
      },
    };
  }

  /**
   * @deprecated Use `sendMessage()` instead
   */
  static message(
    message: string,
    statusCode: number = 200,
    req?: any
  ): { statusCode: number; body: ApiResponseData<null> } {
    return {
      statusCode,
      body: {
        success: true,
        data: null,
        message,
        meta: {
          timestamp: new Date().toISOString(),
          path: req?.originalUrl || "/api/v1",
          method: req?.method || "GET",
          requestId: req?.headers?.["x-request-id"] || undefined,
        },
      },
    };
  }

  /**
   * @deprecated Use `sendPaginated()` instead
   */
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
    req?: any
  ): { statusCode: number; body: PaginatedResponse<T> } {
    const totalPages = Math.ceil(total / limit);

    return {
      statusCode: 200,
      body: {
        success: true,
        data,
        message,
        meta: {
          timestamp: new Date().toISOString(),
          path: req?.originalUrl || "/api/v1",
          method: req?.method || "GET",
          requestId: req?.headers?.["x-request-id"] || undefined,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      },
    };
  }

  /**
   * @deprecated Use `sendNoContent()` instead
   */
  static noContent(): { statusCode: number; body: null } {
    return {
      statusCode: 204,
      body: null,
    };
  }
}
