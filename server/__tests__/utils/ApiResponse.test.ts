import { ApiResponse } from "../../src/utils/response/ApiResponse";

describe("ApiResponse", () => {
  const mockRequest = {
    originalUrl: "/api/v1/test",
    method: "GET",
    headers: {
      "x-request-id": "test-request-id",
    },
  };

  describe("success", () => {
    it("should create a successful response with default values", () => {
      const data = { message: "test" };
      const response = ApiResponse.success(data);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(data);
      expect(response.body.message).toBeUndefined();
      expect(response.body.meta.timestamp).toBeDefined();
      expect(response.body.meta.path).toBe("/api/v1");
      expect(response.body.meta.method).toBe("GET");
    });

    it("should create a successful response with custom message and status code", () => {
      const data = { message: "test" };
      const response = ApiResponse.success(
        data,
        "Custom message",
        201,
        mockRequest
      );

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(data);
      expect(response.body.message).toBe("Custom message");
      expect(response.body.meta.path).toBe("/api/v1/test");
      expect(response.body.meta.method).toBe("GET");
      expect(response.body.meta.requestId).toBe("test-request-id");
    });
  });

  describe("paginated", () => {
    it("should create a paginated response", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = ApiResponse.paginated(
        data,
        1,
        10,
        25,
        "Paginated data",
        mockRequest
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(data);
      expect(response.body.message).toBe("Paginated data");
      expect(response.body.meta.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });
    });

    it("should handle pagination edge cases", () => {
      const data = [{ id: 1 }];
      const response = ApiResponse.paginated(
        data,
        3,
        10,
        25,
        "Last page",
        mockRequest
      );

      expect(response.body.meta.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      });
    });
  });

  describe("error", () => {
    it("should create an error response with default values", () => {
      const response = ApiResponse.error("Test error");

      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBeNull();
      expect(response.body.error?.message).toBe("Test error");
      expect(response.body.error?.code).toBeUndefined();
      expect(response.body.error?.details).toBeUndefined();
    });

    it("should create an error response with custom status code and code", () => {
      const response = ApiResponse.error(
        "Bad Request",
        400,
        "BAD_REQUEST",
        mockRequest,
        { field: "test" }
      );

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error?.message).toBe("Bad Request");
      expect(response.body.error?.code).toBe("BAD_REQUEST");
      expect(response.body.error?.details).toEqual({ field: "test" });
      expect(response.body.meta.requestId).toBe("test-request-id");
    });
  });

  describe("created", () => {
    it("should create a created response", () => {
      const data = { id: 1, name: "test" };
      const response = ApiResponse.created(
        data,
        "Resource created",
        mockRequest
      );

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(data);
      expect(response.body.message).toBe("Resource created");
    });
  });

  describe("noContent", () => {
    it("should create a no content response", () => {
      const response = ApiResponse.noContent();

      expect(response.statusCode).toBe(204);
      expect(response.body).toBeNull();
    });
  });

  describe("message", () => {
    it("should create a message-only response", () => {
      const response = ApiResponse.message(
        "Operation successful",
        200,
        mockRequest
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();
      expect(response.body.message).toBe("Operation successful");
    });

    it("should create a message-only response with custom status code", () => {
      const response = ApiResponse.message("Accepted", 202);

      expect(response.statusCode).toBe(202);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Accepted");
    });
  });

  describe("meta information", () => {
    it("should include proper meta information in all responses", () => {
      const response = ApiResponse.success(
        { test: true },
        "Test",
        200,
        mockRequest
      );

      expect(response.body.meta).toMatchObject({
        timestamp: expect.any(String),
        path: "/api/v1/test",
        method: "GET",
        requestId: "test-request-id",
      });

      // Verify timestamp is valid ISO string
      expect(new Date(response.body.meta.timestamp).toISOString()).toBe(
        response.body.meta.timestamp
      );
    });

    it("should handle missing request information gracefully", () => {
      const response = ApiResponse.success({ test: true });

      expect(response.body.meta).toMatchObject({
        timestamp: expect.any(String),
        path: "/api/v1",
        method: "GET",
        requestId: undefined,
      });
    });
  });
});
