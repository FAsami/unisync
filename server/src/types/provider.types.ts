/**
 * Provider Configuration Types
 * Types for OTP delivery providers (SMS, Email, etc.)
 */

import { OTPPurpose } from "./otp.types";

export type ValueType =
  | "ENV_VARIABLE"
  | "CONSTANT"
  | "TEMPLATE_VARIABLE"
  | "STATIC";

export interface ValueConfig {
  type?: ValueType;
  name?: string; // For ENV_VARIABLE
  value?: string | number; // For CONSTANT or TEMPLATE_VARIABLE template
  key?: string; // For TEMPLATE_VARIABLE mapping
}

export interface QueryParam {
  key: string;
  value: string | ValueConfig;
  type?: ValueType;
}

export interface EndpointConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH";
  query?: QueryParam[];
  body?: Record<string, any>;
  headers?: Record<string, string>;
  variables?: {
    env?: string[]; // Required environment variables
    template?: string[]; // Available template variables (e.g., "number", "message")
  };
}

export interface ResponseValidation {
  successCondition?: {
    field: string; // JSON path to check (e.g., "Status", "data.success")
    operator: "equals" | "not_equals" | "contains" | "exists";
    value: any;
  };
  errorMessageField?: string; // JSON path to error message
}

export interface ProviderMetadata {
  identifier: string;
  name: string;
  website: string;
  description?: string;
  supportedCountries?: string[];
  requiresVerification?: boolean;
}

export interface MessageTemplate {
  otp?: {
    message: string; // Template with {{otp}} placeholder
  };
  login?: string;
  signup?: string;
  passwordReset?: string;
}

export interface ProviderConfig {
  provider: ProviderMetadata & {
    endpoint: EndpointConfig;
  };
  template?: MessageTemplate;
  validation?: ResponseValidation;
  providerToUse?: string; // For multi-provider configs
}

export interface ProviderConfigWrapper {
  identifier: string;
  scope: string;
  value: ProviderConfig;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Provider Interfaces
 */
export interface OTPProvider {
  /**
   * Send OTP to the specified recipient
   * @param to - Recipient identifier (email or phone)
   * @param otp - The OTP code to send
   * @param purpose - Purpose of the OTP (LOGIN, SIGNUP, PASSWORD_RESET)
   * @returns Promise that resolves when OTP is sent
   */
  send(to: string, otp: string, purpose: OTPPurpose): Promise<void>;
}

export interface EmailProvider extends OTPProvider {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

export interface SMSProvider extends OTPProvider {
  sendSMS(to: string, message: string): Promise<void>;
}
