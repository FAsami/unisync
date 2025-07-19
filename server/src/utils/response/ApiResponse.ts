export interface ApiResponseData<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    path: string;
    method: string;
    duration?: number;
    requestId?: string;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponseData<T[]> {
  meta: {
    timestamp: string;
    path: string;
    method: string;
    duration?: number;
    requestId?: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export class ApiResponse {
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
   * Create a paginated response
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
   * Create an error response
   */
  static error(
    message: string,
    statusCode: number = 500,
    code?: string,
    req?: any,
    details?: any
  ): { statusCode: number; body: ApiResponseData<null> } {
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
   * Create a created response (201)
   */
  static created<T>(
    data: T,
    message?: string,
    req?: any
  ): { statusCode: number; body: ApiResponseData<T> } {
    return this.success(data, message, 201, req);
  }

  static noContent(): { statusCode: number; body: null } {
    return {
      statusCode: 204,
      body: null,
    };
  }

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
}
