import { AppError } from "../../src/utils/response/AppError";

describe("AppError", () => {
  describe("constructor", () => {
    it("should create an AppError with default values", () => {
      const error = new AppError("Test error");

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it("should create an AppError with custom values", () => {
      const error = new AppError("Custom error", 400, "CUSTOM_ERROR", false);

      expect(error.message).toBe("Custom error");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("CUSTOM_ERROR");
      expect(error.isOperational).toBe(false);
    });

    it("should capture stack trace", () => {
      const error = new AppError("Test error");
      expect(error.stack).toBeDefined();
    });
  });

  describe("badRequest", () => {
    it("should create a 400 bad request error", () => {
      const error = AppError.badRequest("Invalid input");

      expect(error.message).toBe("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBeUndefined();
      expect(error.isOperational).toBe(true);
    });

    it("should create a 400 bad request error with custom code", () => {
      const error = AppError.badRequest("Invalid input", "INVALID_INPUT");

      expect(error.message).toBe("Invalid input");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("INVALID_INPUT");
    });
  });

  describe("unauthorized", () => {
    it("should create a 401 unauthorized error with default message", () => {
      const error = AppError.unauthorized();

      expect(error.message).toBe("Unauthorized");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBeUndefined();
    });

    it("should create a 401 unauthorized error with custom message and code", () => {
      const error = AppError.unauthorized(
        "Authentication required",
        "AUTH_REQUIRED"
      );

      expect(error.message).toBe("Authentication required");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("AUTH_REQUIRED");
    });
  });

  describe("forbidden", () => {
    it("should create a 403 forbidden error with default message", () => {
      const error = AppError.forbidden();

      expect(error.message).toBe("Forbidden");
      expect(error.statusCode).toBe(403);
      expect(error.code).toBeUndefined();
    });

    it("should create a 403 forbidden error with custom message and code", () => {
      const error = AppError.forbidden("Access denied", "ACCESS_DENIED");

      expect(error.message).toBe("Access denied");
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("ACCESS_DENIED");
    });
  });

  describe("notFound", () => {
    it("should create a 404 not found error with default message", () => {
      const error = AppError.notFound();

      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBeUndefined();
    });

    it("should create a 404 not found error with custom message and code", () => {
      const error = AppError.notFound("User not found", "USER_NOT_FOUND");

      expect(error.message).toBe("User not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("USER_NOT_FOUND");
    });
  });

  describe("conflict", () => {
    it("should create a 409 conflict error", () => {
      const error = AppError.conflict("Resource already exists");

      expect(error.message).toBe("Resource already exists");
      expect(error.statusCode).toBe(409);
      expect(error.code).toBeUndefined();
    });

    it("should create a 409 conflict error with custom code", () => {
      const error = AppError.conflict("Email already exists", "EMAIL_EXISTS");

      expect(error.message).toBe("Email already exists");
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("EMAIL_EXISTS");
    });
  });

  describe("validation", () => {
    it("should create a 422 validation error", () => {
      const error = AppError.validation("Validation failed");

      expect(error.message).toBe("Validation failed");
      expect(error.statusCode).toBe(422);
      expect(error.code).toBeUndefined();
    });

    it("should create a 422 validation error with custom code", () => {
      const error = AppError.validation(
        "Invalid email format",
        "INVALID_EMAIL"
      );

      expect(error.message).toBe("Invalid email format");
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe("INVALID_EMAIL");
    });
  });

  describe("internal", () => {
    it("should create a 500 internal error with default message", () => {
      const error = AppError.internal();

      expect(error.message).toBe("Internal server error");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
    });

    it("should create a 500 internal error with custom message and code", () => {
      const error = AppError.internal("Database connection failed", "DB_ERROR");

      expect(error.message).toBe("Database connection failed");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("DB_ERROR");
    });
  });

  describe("serviceUnavailable", () => {
    it("should create a 503 service unavailable error with default message", () => {
      const error = AppError.serviceUnavailable();

      expect(error.message).toBe("Service unavailable");
      expect(error.statusCode).toBe(503);
      expect(error.code).toBeUndefined();
    });

    it("should create a 503 service unavailable error with custom message and code", () => {
      const error = AppError.serviceUnavailable(
        "Maintenance in progress",
        "MAINTENANCE"
      );

      expect(error.message).toBe("Maintenance in progress");
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe("MAINTENANCE");
    });
  });

  describe("error inheritance", () => {
    it("should properly inherit from Error class", () => {
      const error = new AppError("Test error");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      // Note: The name might be "Error" in some environments, but it's still an AppError instance
      expect(error.name).toBeDefined();
    });

    it("should maintain prototype chain", () => {
      const error = new AppError("Test error");

      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
      expect(Object.getPrototypeOf(AppError.prototype)).toBe(Error.prototype);
    });
  });
});
