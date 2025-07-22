import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosClient } from "./axios";
import { jwtDecode } from "jwt-decode";
import NetInfo from "@react-native-community/netinfo";

// Simple event emitter for auth events
type AuthEventType = "SESSION_REVOKED" | "SESSION_EXPIRED" | "AUTH_ERROR";
type AuthEventListener = (data?: any) => void;

class AuthEventEmitter {
  private listeners: Map<AuthEventType, AuthEventListener[]> = new Map();

  on(event: AuthEventType, listener: AuthEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: AuthEventType, listener: AuthEventListener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: AuthEventType, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
  }
}

export const authEventEmitter = new AuthEventEmitter();

interface TokenCache {
  token: string;
  expires: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  session_id: string;
}

interface ApiResponse {
  success: boolean;
  data: TokenResponse;
}

let tokenCache: TokenCache | null = null;

const clearTokenCache = () => {
  tokenCache = null;
};

const cacheToken = (token: string) => {
  try {
    const decoded: any = jwtDecode(token);
    if (decoded.exp) {
      tokenCache = {
        token,
        expires: decoded.exp * 1000 - 60000, // 1 minute buffer
      };
    }
  } catch (error) {
    console.warn("Failed to decode token for caching:", error);
  }
};

const isTokenValid = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp && decoded.exp > now + 30; // 30 second buffer
  } catch {
    return false;
  }
};

const handleTokenStorage = async (tokenData: TokenResponse) => {
  try {
    await Promise.all([
      AsyncStorage.setItem("access_token", tokenData.access_token),
      AsyncStorage.setItem("refresh_token", tokenData.refresh_token),
      AsyncStorage.setItem("session_id", tokenData.session_id),
    ]);
    cacheToken(tokenData.access_token);
  } catch (error) {
    console.error("Failed to store tokens:", error);
    throw new Error("Token storage failed");
  }
};

const clearStoredTokens = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem("access_token"),
      AsyncStorage.removeItem("refresh_token"),
      AsyncStorage.removeItem("session_id"),
    ]);
    clearTokenCache();
  } catch (error) {
    console.warn("Failed to clear stored tokens:", error);
  }
};

const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  } catch (error) {
    console.warn("Failed to check network connectivity:", error);
    return true; // Assume connected if check fails
  }
};

const attemptTokenRefresh = async (
  refreshToken: string
): Promise<string | null> => {
  try {
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      console.log("No network connection, skipping token refresh");
      return null;
    }

    console.log("Attempting token refresh...");
    const response = await axiosClient.post<ApiResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });

    if (response.data.success && response.data.data) {
      await handleTokenStorage(response.data.data);
      console.log("Token refresh successful");
      return response.data.data.access_token;
    }

    console.warn("Token refresh response invalid");
    return null;
  } catch (error: any) {
    const errorData = error.response?.data?.error;
    const errorCode = errorData?.code;

    console.error(
      "Token refresh failed:",
      error.response?.data || error.message
    );

    // Handle specific revocation scenarios
    if (error.response?.status === 401) {
      if (errorCode === "SESSION_REVOKED") {
        console.warn(
          "⚠️ Session has been revoked by server - clearing all tokens"
        );
        await clearStoredTokens();
        authEventEmitter.emit("SESSION_REVOKED", {
          reason: "Session revoked by server",
          timestamp: new Date().toISOString(),
        });
        return null;
      } else if (
        errorCode === "SESSION_NOT_FOUND" ||
        errorCode === "REFRESH_TOKEN_EXPIRED"
      ) {
        console.warn(
          "⚠️ Session not found or refresh token expired - clearing tokens"
        );
        await clearStoredTokens();
        authEventEmitter.emit("SESSION_EXPIRED", {
          reason:
            errorCode === "SESSION_NOT_FOUND"
              ? "Session not found"
              : "Refresh token expired",
          timestamp: new Date().toISOString(),
        });
        return null;
      } else {
        // Generic 401 - likely expired or invalid token
        console.warn("⚠️ Token refresh unauthorized - clearing tokens");
        await clearStoredTokens();
        authEventEmitter.emit("AUTH_ERROR", {
          reason: "Unauthorized token refresh",
          timestamp: new Date().toISOString(),
        });
        return null;
      }
    }

    return null;
  }
};

const attemptGuestTokenGeneration = async (): Promise<string | null> => {
  try {
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      console.log("No network connection, skipping guest token generation");
      return null;
    }

    console.log("Generating new guest token...");
    const response = await axiosClient.post<ApiResponse>("/auth/guest-session");

    if (response.data.success && response.data.data) {
      await handleTokenStorage(response.data.data);
      console.log("Guest token generation successful");
      return response.data.data.access_token;
    }

    console.error("Guest token response invalid");
    return null;
  } catch (error: any) {
    console.error(
      "Guest token generation failed:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const getGuestSessionToken = async (
  forceRefresh = false
): Promise<string | null> => {
  try {
    // Return cached token if valid and not forcing refresh
    if (!forceRefresh && tokenCache && tokenCache.expires > Date.now()) {
      console.log("Returning cached token");
      return tokenCache.token;
    }

    let accessToken = await AsyncStorage.getItem("access_token");
    let refreshToken = await AsyncStorage.getItem("refresh_token");

    // Try to use existing access token if valid
    if (!forceRefresh && accessToken && isTokenValid(accessToken)) {
      console.log("Using existing valid access token");
      cacheToken(accessToken);
      return accessToken;
    }

    // Try to refresh tokens if we have a refresh token
    if (refreshToken) {
      const refreshedToken = await attemptTokenRefresh(refreshToken);
      if (refreshedToken) {
        return refreshedToken;
      }
    }

    // Generate new guest token as final fallback
    const newToken = await attemptGuestTokenGeneration();
    if (newToken) {
      return newToken;
    }

    console.error("All token acquisition methods failed");
    return null;
  } catch (error) {
    console.error("Unexpected error in getGuestSessionToken:", error);

    // Emergency fallback - try one more guest token generation
    try {
      console.log("Attempting emergency guest token generation...");
      return await attemptGuestTokenGeneration();
    } catch (fallbackError) {
      console.error("Emergency fallback failed:", fallbackError);
      return null;
    }
  }
};

export const clearAuthData = async (): Promise<void> => {
  console.log("Clearing all authentication data");
  await clearStoredTokens();
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getGuestSessionToken();
    return !!token;
  } catch {
    return false;
  }
};

export const refreshTokenIfNeeded = async (): Promise<string | null> => {
  try {
    const accessToken = await AsyncStorage.getItem("access_token");
    if (!accessToken || !isTokenValid(accessToken)) {
      console.log("Token refresh needed");
      return await getGuestSessionToken(true);
    }
    return accessToken;
  } catch {
    return null;
  }
};

export const getOfflineToken = async (): Promise<string | null> => {
  try {
    const accessToken = await AsyncStorage.getItem("access_token");
    if (accessToken && isTokenValid(accessToken)) {
      console.log("Returning cached offline token");
      return accessToken;
    }
    console.log("No valid offline token available");
    return null;
  } catch (error) {
    console.error("Failed to get offline token:", error);
    return null;
  }
};

export const getNetworkStatus = async (): Promise<boolean> => {
  return await checkNetworkConnectivity();
};

export const validateSessionWithServer = async (): Promise<{
  isValid: boolean;
  isRevoked: boolean;
  reason?: string;
}> => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      return { isValid: false, isRevoked: false, reason: "No token found" };
    }

    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      // Can't validate without network, assume valid for now
      return {
        isValid: true,
        isRevoked: false,
        reason: "Offline - cannot validate",
      };
    }

    // Try to make a simple request to validate the token
    try {
      const response = await axiosClient.get("/health", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { isValid: true, isRevoked: false };
    } catch (error: any) {
      if (error.response?.status === 401) {
        const errorData = error.response?.data?.error;
        const errorCode = errorData?.code;

        if (errorCode === "SESSION_REVOKED") {
          await clearStoredTokens();
          authEventEmitter.emit("SESSION_REVOKED", {
            reason: "Session validation failed - revoked",
            timestamp: new Date().toISOString(),
          });
          return { isValid: false, isRevoked: true, reason: "Session revoked" };
        }

        return { isValid: false, isRevoked: false, reason: "Token invalid" };
      }

      // Network or other error - assume valid for now
      return {
        isValid: true,
        isRevoked: false,
        reason: "Cannot validate due to error",
      };
    }
  } catch (error) {
    console.error("Session validation error:", error);
    return { isValid: true, isRevoked: false, reason: "Validation error" };
  }
};

export const handleSessionRevocation = async (): Promise<void> => {
  console.log("🔄 Handling session revocation...");
  await clearStoredTokens();

  // Try to get a new guest session
  try {
    const newToken = await attemptGuestTokenGeneration();
    if (newToken) {
      console.log("✅ New guest session created after revocation");
      authEventEmitter.emit("AUTH_ERROR", {
        reason: "Session revoked, new guest session created",
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error("❌ Failed to create new session after revocation");
    }
  } catch (error) {
    console.error("Failed to create new session after revocation:", error);
  }
};
