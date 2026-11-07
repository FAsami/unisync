import { describe, it, expect } from "vitest";
import {
  phoneSchema,
  passwordSchema,
  registerSchema,
  sendOTPSchema,
  verifyOTPSchema,
} from "../src/schemas";

describe("phoneSchema", () => {
  it.each(["+8801712345678", "01712345678", "+1 415 555 2671".replace(/ /g, "")])(
    "accepts %s",
    (phone) => expect(phoneSchema.safeParse(phone).success).toBe(true)
  );

  it.each(["", "abc", "123", "+88 01712"])("rejects %s", (phone) => {
    expect(phoneSchema.safeParse(phone).success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts a password meeting every rule", () => {
    expect(passwordSchema.safeParse("Str0ng!pass").success).toBe(true);
  });

  it.each([
    ["too short", "S0!a"],
    ["no uppercase", "str0ng!pass"],
    ["no lowercase", "STR0NG!PASS"],
    ["no digit", "Strong!pass"],
    ["no symbol", "Str0ngpass"],
  ])("rejects a password with %s", (_label, pw) => {
    expect(passwordSchema.safeParse(pw).success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    phone: "+8801712345678",
    password: "Str0ng!pass",
    first_name: "Ada",
    last_name: "Lovelace",
  };

  it("defaults role to student and then requires student_id", () => {
    const res = registerSchema.safeParse(base);
    expect(res.success).toBe(false);
    expect(res.error?.issues.map((i) => i.path.join("."))).toContain(
      "student_id"
    );
  });

  it("requires designation and faculty_id for teachers", () => {
    const res = registerSchema.safeParse({ ...base, role: "teacher" });
    const paths = res.error?.issues.map((i) => i.path.join(".")) ?? [];
    expect(paths).toEqual(expect.arrayContaining(["designation", "faculty_id"]));
  });

  it("never lets a client self-assign a privileged role", () => {
    expect(registerSchema.safeParse({ ...base, role: "admin" }).success).toBe(
      false
    );
  });
});

describe("OTP schemas", () => {
  it("normalises purpose and identifier type casing on send", () => {
    const res = sendOTPSchema.parse({
      identifier: "+8801712345678",
      identifierType: "phone",
      purpose: "signup",
    });
    expect(res).toMatchObject({ identifierType: "PHONE", purpose: "SIGNUP" });
  });

  it("requires E.164 phone numbers for OTP send", () => {
    const res = sendOTPSchema.safeParse({
      identifier: "01712345678",
      identifierType: "PHONE",
      purpose: "SIGNUP",
    });
    expect(res.success).toBe(false);
  });

  it("accepts DELETE_ACCOUNT as a purpose", () => {
    expect(
      verifyOTPSchema.safeParse({
        identifier: "+8801712345678",
        otp: "123456",
        purpose: "DELETE_ACCOUNT",
      }).success
    ).toBe(true);
  });
});
