import { Request, Response, NextFunction } from "express";
import { notFoundHandler } from "../../src/middleware/notFoundHandler";

describe("notFoundHandler middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      originalUrl: "/api/v1/nonexistent",
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

  it("should return 404 error response", () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        data: null,
        error: {
          message: "Route /api/v1/nonexistent not found",
          code: "NOT_FOUND",
          details: undefined,
        },
        meta: {
          timestamp: expect.any(String),
          path: "/api/v1/nonexistent",
          method: "GET",
          requestId: "test-request-id",
          duration: expect.any(Number),
        },
      })
    );
  });

  it("should include duration when startTime is available", () => {
    const startTime = Date.now() - 100; // 100ms ago
    mockRequest.startTime = startTime;

    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          duration: expect.any(Number),
        }),
      })
    );
  });

  it("should not include duration when startTime is not available", () => {
    delete mockRequest.startTime;

    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    const responseBody = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(responseBody.meta.duration).toBeUndefined();
  });

  it("should handle requests without request ID", () => {
    delete mockRequest.headers;

    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          requestId: undefined,
        }),
      })
    );
  });

  it("should handle different HTTP methods", () => {
    mockRequest.method = "POST";
    mockRequest.originalUrl = "/api/v1/another-route";

    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "Route /api/v1/another-route not found",
        }),
        meta: expect.objectContaining({
          method: "POST",
          path: "/api/v1/another-route",
        }),
      })
    );
  });

  it("should handle requests with query parameters", () => {
    mockRequest.originalUrl = "/api/v1/search?q=test&page=1";

    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: "Route /api/v1/search?q=test&page=1 not found",
        }),
        meta: expect.objectContaining({
          path: "/api/v1/search?q=test&page=1",
        }),
      })
    );
  });

  it("should include proper timestamp", () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    const responseBody = (mockResponse.json as jest.Mock).mock.calls[0][0];
    const timestamp = responseBody.meta.timestamp;

    expect(timestamp).toBeDefined();
    expect(typeof timestamp).toBe("string");
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });
});
