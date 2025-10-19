/**
 * Provider interface for OTP delivery
 * Supports multiple providers for email and SMS
 */

export interface OTPProvider {
  /**
   * Send OTP to the specified recipient
   * @param to - Recipient identifier (email or phone)
   * @param otp - The OTP code to send
   * @param purpose - Purpose of the OTP (LOGIN, SIGNUP, PASSWORD_RESET)
   * @returns Promise that resolves when OTP is sent
   */
  send(
    to: string,
    otp: string,
    purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
  ): Promise<void>;
}

export interface EmailProvider extends OTPProvider {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

export interface SMSProvider extends OTPProvider {
  sendSMS(to: string, message: string): Promise<void>;
}
