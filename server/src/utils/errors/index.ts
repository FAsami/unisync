/**
 * Unified Error Handling System
 * Throw these errors in controllers - they'll be caught by error middleware
 *
 * Usage:
 * throw new ValidationError("Invalid input");
 * throw new UnauthorizedError();
 * throw new NotFoundError("User not found");
 */

export class HttpError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string,
    public details?: any,
    public type: "ACTION_ERROR" | "API_ERROR" = "API_ERROR"
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
export class BadRequestError extends HttpError {
  constructor(
    message: string = "Bad request",
    code: string = "BAD_REQUEST",
    details?: any
  ) {
    super(message, 400, code, details);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends HttpError {
  constructor(
    message: string = "Unauthorized",
    code: string = "UNAUTHORIZED",
    details?: any
  ) {
    super(message, 401, code, details);
  }
}

// 403 Forbidden
export class ForbiddenError extends HttpError {
  constructor(
    message: string = "Forbidden",
    code: string = "FORBIDDEN",
    details?: any
  ) {
    super(message, 403, code, details);
  }
}

// 404 Not Found
export class NotFoundError extends HttpError {
  constructor(
    message: string = "Resource not found",
    code: string = "NOT_FOUND",
    details?: any
  ) {
    super(message, 404, code, details);
  }
}

// 409 Conflict
export class ConflictError extends HttpError {
  constructor(
    message: string = "Resource conflict",
    code: string = "CONFLICT",
    details?: any
  ) {
    super(message, 409, code, details);
  }
}

// 422 Unprocessable Entity (Validation Errors)
export class ValidationError extends HttpError {
  constructor(
    message: string = "Validation failed",
    details?: any,
    code: string = "VALIDATION_ERROR"
  ) {
    super(message, 400, code, details);
  }
}

// 429 Too Many Requests
export class TooManyRequestsError extends HttpError {
  constructor(
    message: string = "Too many requests",
    code: string = "RATE_LIMIT_EXCEEDED",
    details?: any
  ) {
    super(message, 429, code, details);
  }
}

// 500 Internal Server Error
export class InternalServerError extends HttpError {
  constructor(
    message: string = "Internal server error",
    code: string = "INTERNAL_ERROR",
    details?: any
  ) {
    super(message, 500, code, details);
  }
}

// Hasura Action Error (returns extensions format)
export class ActionError extends HttpError {
  constructor(
    message: string,
    code: string,
    details?: any,
    statusCode: number = 400
  ) {
    super(message, statusCode, code, details, "ACTION_ERROR");
  }
}

// Common Auth Errors
export class InvalidCredentialsError extends UnauthorizedError {
  constructor(message: string = "Invalid credentials") {
    super(message, "INVALID_CREDENTIALS");
  }
}

export class TokenExpiredError extends UnauthorizedError {
  constructor(message: string = "Token has expired") {
    super(message, "TOKEN_EXPIRED");
  }
}

export class InvalidTokenError extends UnauthorizedError {
  constructor(message: string = "Invalid token") {
    super(message, "INVALID_TOKEN");
  }
}

// OTP specific errors
export class InvalidOTPError extends ActionError {
  constructor(message: string = "Invalid or expired OTP", details?: any) {
    super(message, "INVALID_OTP", details);
  }
}

export class OTPExpiredError extends ActionError {
  constructor(message: string = "OTP has expired. Please request a new one.") {
    super(message, "OTP_EXPIRED");
  }
}

export class OTPAlreadyUsedError extends ActionError {
  constructor(message: string = "OTP has already been used") {
    super(message, "OTP_ALREADY_USED");
  }
}

export class MaxAttemptsError extends ActionError {
  constructor(
    message: string = "Maximum verification attempts reached. Please request a new OTP."
  ) {
    super(message, "MAX_ATTEMPTS_REACHED");
  }
}
