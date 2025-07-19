import { Request, Response, NextFunction } from "express";
import { requestInfo } from "../../src/middleware/requestInfo";

describe("requestInfo middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      originalUrl: "/api/v1/test",
    };
    mockResponse = {
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should generate a request ID when none is provided", () => {
    requestInfo(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.headers!["x-request-id"]).toBeDefined();
    expect(typeof mockRequest.headers!["x-request-id"]).toBe("string");
    expect(mockRequest.requestId).toBe(mockRequest.headers!["x-request-id"]);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      "x-request-id",
      mockRequest.requestId
    );
    expect(mockRequest.startTime).toBeDefined();
    expect(typeof mockRequest.startTime).toBe("number");
    expect(mockNext).toHaveBeenCalled();
  });

  it("should use existing request ID when provided", () => {
    const existingRequestId = "existing-request-id";
    mockRequest.headers!["x-request-id"] = existingRequestId;

    requestInfo(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.headers!["x-request-id"]).toBe(existingRequestId);
    expect(mockRequest.requestId).toBe(existingRequestId);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      "x-request-id",
      existingRequestId
    );
    expect(mockRequest.startTime).toBeDefined();
    expect(mockNext).toHaveBeenCalled();
  });

  it("should set startTime to current timestamp", () => {
    const beforeTime = Date.now();
    requestInfo(mockRequest as Request, mockResponse as Response, mockNext);
    const afterTime = Date.now();

    expect(mockRequest.startTime).toBeGreaterThanOrEqual(beforeTime);
    expect(mockRequest.startTime).toBeLessThanOrEqual(afterTime);
  });

  it("should generate unique request IDs for different requests", () => {
    const request1 = {
      headers: {},
      originalUrl: "/api/v1/test1",
    } as Partial<Request>;
    const request2 = {
      headers: {},
      originalUrl: "/api/v1/test2",
    } as Partial<Request>;
    const response = { setHeader: jest.fn() } as Partial<Response>;

    requestInfo(request1 as Request, response as Response, mockNext);
    requestInfo(request2 as Request, response as Response, mockNext);

    expect(request1.headers!["x-request-id"]).not.toBe(
      request2.headers!["x-request-id"]
    );
  });

  it("should handle requests with minimal headers", () => {
    mockRequest.headers = undefined;

    requestInfo(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.headers).toBeDefined();
    expect(mockRequest.headers!["x-request-id"]).toBeDefined();
    expect(mockRequest.requestId).toBeDefined();
    expect(mockRequest.startTime).toBeDefined();
    expect(mockNext).toHaveBeenCalled();
  });

  it("should call next function", () => {
    requestInfo(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });
});
