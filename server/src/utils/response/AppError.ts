export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, code?: string): AppError {
    return new AppError(message, 400, code);
  }

  static unauthorized(
    message: string = "Unauthorized",
    code?: string
  ): AppError {
    return new AppError(message, 401, code);
  }

  static forbidden(message: string = "Forbidden", code?: string): AppError {
    return new AppError(message, 403, code);
  }

  static notFound(
    message: string = "Resource not found",
    code?: string
  ): AppError {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code?: string): AppError {
    return new AppError(message, 409, code);
  }

  static validation(message: string, code?: string): AppError {
    return new AppError(message, 422, code);
  }

  static internal(
    message: string = "Internal server error",
    code?: string
  ): AppError {
    return new AppError(message, 500, code);
  }

  static serviceUnavailable(
    message: string = "Service unavailable",
    code?: string
  ): AppError {
    return new AppError(message, 503, code);
  }
}
