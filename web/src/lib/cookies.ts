import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const cookieOptions = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  httpOnly: false, // Must be false for client-side access with js-cookie
};

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set(TOKEN_KEY, accessToken, cookieOptions);
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, cookieOptions);
};

export const getAccessToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  return Cookies.get(TOKEN_KEY);
};

export const getRefreshToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const clearAuthTokens = () => {
  Cookies.remove(TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};
