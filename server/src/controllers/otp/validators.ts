export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") {
    return false;
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (email.length > 254) return false;

  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== "string") {
    return false;
  }
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const validateIdentifier = (
  identifier: string,
  type: "EMAIL" | "PHONE"
): { valid: boolean; error?: string } => {
  if (!identifier) {
    return { valid: false, error: "Identifier is required" };
  }

  if (type === "EMAIL") {
    if (!isValidEmail(identifier)) {
      return { valid: false, error: "Invalid email format" };
    }
  } else if (type === "PHONE") {
    if (!isValidPhone(identifier)) {
      return {
        valid: false,
        error:
          "Invalid phone number format. Use E.164 format (e.g., +14155552671)",
      };
    }
  } else {
    return { valid: false, error: "Invalid identifier type" };
  }

  return { valid: true };
};

export const isValidOTPFormat = (
  otp: string,
  expectedLength: number
): boolean => {
  if (!otp || typeof otp !== "string") {
    return false;
  }
  const otpRegex = new RegExp(`^\\d{${expectedLength}}$`);
  return otpRegex.test(otp);
};

export const sanitizeIdentifier = (identifier: string): string => {
  if (!identifier) return "";
  return identifier.trim().toLowerCase();
};

export const isValidPurpose = (
  purpose: string
): purpose is "LOGIN" | "SIGNUP" | "PASSWORD_RESET" => {
  return ["LOGIN", "SIGNUP", "PASSWORD_RESET"].includes(purpose);
};
