import { Response } from "express";
import { ApiResponseData } from "../../types";

function buildMeta(res: Response): ApiResponseData["meta"] {
  const req = (res as any).req || res;
  return {
    timestamp: new Date().toISOString(),
    path: req?.originalUrl || req?.url || "/api/v1",
    method: req?.method || "GET",
    requestId: req?.headers?.["x-request-id"] || undefined,
  };
}

declare global {
  namespace Express {
    interface Response {
      /**
       * Send success response (200)
       * @param message - Success message
       * @param data - Response data
       * @param statusCode - HTTP status code (default: 200)
       */
      success<T = any>(message: string, data?: T, statusCode?: number): void;

      /**
       * Send created response (201)
       * @param message - Success message
       * @param data - Created resource data
       */
      created<T = any>(message: string, data: T): void;

      /**
       * Send error response
       * @param message - Error message
       * @param statusCode - HTTP status code (default: 500)
       * @param code - Error code
       * @param details - Additional error details
       * @param type - Response type for Hasura actions vs regular API
       */
      error(
        message: string,
        statusCode?: number,
        code?: string,
        details?: any,
        type?: "ACTION_ERROR" | "API_ERROR"
      ): void;

      /**
       * Send message-only response (no data)
       * @param message - Message to send
       * @param statusCode - HTTP status code (default: 200)
       */
      message(message: string, statusCode?: number): void;

      /**
       * Send paginated response
       * @param message - Success message
       * @param data - Array of items
       * @param page - Current page number
       * @param limit - Items per page
       * @param total - Total number of items
       */
      paginated<T = any>(
        message: string,
        data: T[],
        page: number,
        limit: number,
        total: number
      ): void;

      /**
       * Send no content response (204)
       */
      noContent(): void;
    }
  }
}

/**
 * Install response extension methods
 * Call this in your middleware setup
 */
export function installResponseExtensions() {
  // Import express to get the actual response prototype
  const express = require("express");

  /**
   * Send success response (200)
   */
  express.response.success = function <T = any>(
    this: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): void {
    this.status(statusCode).json({
      success: true,
      message,
      data: data ?? null,
      meta: buildMeta(this),
    });
  };

  /**
   * Send created response (201)
   */
  express.response.created = function <T = any>(
    this: Response,
    message: string,
    data: T
  ): void {
    this.success(message, data, 201);
  };

  /**
   * Send error response
   */
  express.response.error = function (
    this: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any,
    type: "ACTION_ERROR" | "API_ERROR" = "API_ERROR"
  ): void {
    const req = (this as any).req || this;

    // For Hasura actions, return simplified format with extensions
    if (type === "ACTION_ERROR") {
      this.status(statusCode).json({
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
    this.status(statusCode).json({
      success: false,
      data: null,
      error: {
        message,
        code,
        details,
      },
      meta: buildMeta(this),
    });
  };

  /**
   * Send message-only response (no data)
   */
  express.response.message = function (
    this: Response,
    message: string,
    statusCode: number = 200
  ): void {
    this.status(statusCode).json({
      success: true,
      message,
      data: null,
      meta: buildMeta(this),
    });
  };

  /**
   * Send paginated response
   */
  express.response.paginated = function <T = any>(
    this: Response,
    message: string,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): void {
    const totalPages = Math.ceil(total / limit);

    this.status(200).json({
      success: true,
      message,
      data,
      meta: {
        ...buildMeta(this),
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
  };

  /**
   * Send no content response (204)
   */
  express.response.noContent = function (this: Response): void {
    this.status(204).send();
  };
}
