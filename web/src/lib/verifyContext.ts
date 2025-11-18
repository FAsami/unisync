export type VerifyFlow = "register" | "reset-password" | "phone-verify";

export type VerifyIdentifierType = "PHONE" | "EMAIL";

export type VerifyPurpose = "LOGIN" | "SIGNUP" | "PASSWORD_RESET";

export interface VerifyContext {
  flow: VerifyFlow;
  identifier: string;
  identifierType: VerifyIdentifierType;
  purpose: VerifyPurpose;
  redirectTo?: string;
  resendAvailableAt?: number;
}

const KEY = "auth.verify.context";

const isVerifyContext = (value: unknown): value is VerifyContext => {
  if (!value || typeof value !== "object") return false;
  const ctx = value as Partial<VerifyContext>;
  return (
    typeof ctx.flow === "string" &&
    typeof ctx.identifier === "string" &&
    ctx.identifier.length > 0 &&
    (ctx.identifierType === "PHONE" || ctx.identifierType === "EMAIL") &&
    (ctx.purpose === "LOGIN" ||
      ctx.purpose === "SIGNUP" ||
      ctx.purpose === "PASSWORD_RESET")
  );
};

export const saveVerifyContext = (context: VerifyContext) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(context));
};

export const loadVerifyContext = (): VerifyContext | null => {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (isVerifyContext(parsed)) {
      return parsed;
    }
  } catch {
    // ignore parse errors
  }

  return null;
};

export const updateVerifyContext = (
  patch: Partial<VerifyContext>
): VerifyContext | null => {
  if (typeof window === "undefined") return null;
  const current = loadVerifyContext();
  if (!current) return null;
  const next = { ...current, ...patch };
  sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
};

export const clearVerifyContext = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
};

export const RESEND_INTERVAL_SECONDS = 60;
