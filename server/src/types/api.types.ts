/**
 * API Response Types
 * Centralized type definitions for API responses
 */

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

export interface RequestInfo {
  requestId: string;
  method: string;
  path: string;
  startTime: number;
  duration?: number;
}

export type AsyncRequestHandler = (
  req: any,
  res: any,
  next: any
) => Promise<void | any>;
