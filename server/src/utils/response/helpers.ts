/**
 * Response Helper Utilities
 * Use these for quick, clean responses in controllers
 */

import { Request, Response } from "express";
import { ApiResponse } from "./ApiResponse";

/**
 * Send a success response with data
 * @example sendSuccess(res, { user }, "User created", 201, req)
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  req?: Request
): void => {
  const response = ApiResponse.success(data, message, statusCode, req);
  res.status(response.statusCode).json(response.body);
};

/**
 * Send a created response (201)
 * @example sendCreated(res, { user }, "User created", req)
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message?: string,
  req?: Request
): void => {
  sendSuccess(res, data, message, 201, req);
};

/**
 * Send a simple message response
 * @example sendMessage(res, "Operation completed successfully", req)
 */
export const sendMessage = (
  res: Response,
  message: string,
  statusCode: number = 200,
  req?: Request
): void => {
  const response = ApiResponse.message(message, statusCode, req);
  res.status(response.statusCode).json(response.body);
};

/**
 * Send a no content response (204)
 * @example sendNoContent(res)
 */
export const sendNoContent = (res: Response): void => {
  const response = ApiResponse.noContent();
  res.status(response.statusCode).send();
};

/**
 * Validate input with Zod and throw ValidationError if invalid
 * This makes controllers much cleaner
 *
 * @example
 * const data = validateInput(loginSchema, req.body);
 */
export const validateInput = <T>(schema: any, data: any): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    // Import here to avoid circular dependency
    const { ValidationError } = require("../errors");
    throw new ValidationError("Validation failed", result.error.issues);
  }
  return result.data;
};

/**
 * Validate Hasura action input (extracts from req.body.input)
 * @example
 * const data = validateActionInput(sendOTPSchema, req);
 */
export const validateActionInput = <T>(schema: any, req: Request): T => {
  const rawInput = req.body?.input;
  if (!rawInput) {
    const { ActionError } = require("../errors");
    throw new ActionError("Invalid request format", "INVALID_REQUEST");
  }
  return validateInput<T>(schema, rawInput);
};

/**
 * Send an action success response (Hasura format)
 * @example sendActionSuccess(res, { success: true, verified: true }, req)
 */
export const sendActionSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  req?: Request
): void => {
  sendSuccess(res, data, message, 200, req);
};
