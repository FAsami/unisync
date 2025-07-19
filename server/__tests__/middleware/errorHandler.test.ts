import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../src/middleware/errorHandler";
import { AppError } from "../../src/utils/response/AppError";

describe("errorHandler middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      originalUrl: "/api/v1/test",
      method: "GET",
      headers: {
        "x-request-id": "test-request-id",
      },
      startTime: Date.now(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should handle generic errors with default values", () => {
    const error = new Error("Generic error");

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        data: null,
        error: {
          message: "Internal Server Error",
          code: undefined,
          details: error.stack,
        },
        meta: {
          timestamp: expect.any(String),
          path: "/api/v1/test",
          method: "GET",
          requestId: "test-request-id",
          duration: expect.any(Number),
        },
      })
    );
  });

  it("should handle AppError instances", () => {
    const appError = AppError.badRequest("Invalid input", "INVALID_INPUT");

    errorHandler(
      appError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        data: null,
        error: {
          message: "Invalid input",
          code: "INVALID_INPUT",
          details: appError.stack,
        },
      })
    );
  });

  it("should handle ValidationError", () => {
    const validationError = new Error("Validation failed");
    validationError.name = "ValidationError";

    errorHandler(
      validationError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: validationError.stack,
        },
      })
    );
  });

  it("should handle CastError", () => {
    const castError = new Error("Cast to ObjectId failed");
    castError.name = "CastError";

    errorHandler(
      castError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          message: "Invalid resource ID",
          code: "INVALID_ID",
          details: castError.stack,
        },
      })
    );
  });

  it("should handle MongoError with duplicate key", () => {
    const mongoError = new Error("Duplicate key error");
    mongoError.name = "MongoError";
    (mongoError as any).code = 11000;

    errorHandler(
      mongoError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          message: "Resource already exists",
          code: "DUPLICATE_KEY",
          details: mongoError.stack,
        },
      })
    );
  });

  it("should handle MongoError without duplicate key code", () => {
    const mongoError = new Error("Mongo error");
    mongoError.name = "MongoError";
    (mongoError as any).code = 12345; // Different code

    errorHandler(
      mongoError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          message: "Internal Server Error",
          code: undefined,
          details: mongoError.stack,
        },
      })
    );
  });

  it("should include duration when startTime is available", () => {
    const error = new Error("Test error");
    const startTime = Date.now() - 100; // 100ms ago
    mockRequest.startTime = startTime;

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          duration: expect.any(Number),
        }),
      })
    );
  });

  it("should not include duration when startTime is not available", () => {
    const error = new Error("Test error");
    delete mockRequest.startTime;

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    const responseBody = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(responseBody.meta.duration).toBeUndefined();
  });

  it("should handle requests without request ID", () => {
    const error = new Error("Test error");
    delete mockRequest.headers;

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          requestId: undefined,
        }),
      })
    );
  });

  it("should preserve original error message for AppError", () => {
    const appError = new AppError("Custom error message", 400, "CUSTOM_ERROR");

    errorHandler(
      appError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "Custom error message",
        }),
      })
    );
  });
});
