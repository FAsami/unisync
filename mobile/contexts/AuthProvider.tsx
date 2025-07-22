import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  getGuestSessionToken,
  isAuthenticated,
  getNetworkStatus,
  authEventEmitter,
  handleSessionRevocation,
} from "@/lib/auth";

interface AuthContextType {
  isLoading: boolean;
  isOnline: boolean;
  hasValidToken: boolean;
  isSessionRevoked: boolean;
  refreshAuth: () => Promise<void>;
  handleRevocation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [isSessionRevoked, setIsSessionRevoked] = useState(false);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      const [networkStatus, authStatus] = await Promise.all([
        getNetworkStatus(),
        isAuthenticated(),
      ]);

      setIsOnline(networkStatus);
      setHasValidToken(authStatus);

      console.log(
        `Auth status: online=${networkStatus}, authenticated=${authStatus}`
      );
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setHasValidToken(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      const token = await getGuestSessionToken(true);
      setHasValidToken(!!token);
      setIsSessionRevoked(false);
    } catch (error) {
      console.error("Failed to refresh auth:", error);
      setHasValidToken(false);
    }
  };

  const handleRevocation = async () => {
    try {
      await handleSessionRevocation();
      setIsSessionRevoked(false);
      setHasValidToken(false);
      // Re-check auth status after handling revocation
      await checkAuthStatus();
    } catch (error) {
      console.error("Failed to handle revocation:", error);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Check auth status periodically
    const interval = setInterval(checkAuthStatus, 30000); // Every 30 seconds

    // Listen for auth events
    const handleSessionRevokedEvent = () => {
      console.log("🚨 Session revoked event received");
      setIsSessionRevoked(true);
      setHasValidToken(false);
    };

    const handleSessionExpiredEvent = () => {
      console.log("⏰ Session expired event received");
      setHasValidToken(false);
    };

    const handleAuthErrorEvent = () => {
      console.log("❌ Auth error event received");
      setHasValidToken(false);
    };

    authEventEmitter.on("SESSION_REVOKED", handleSessionRevokedEvent);
    authEventEmitter.on("SESSION_EXPIRED", handleSessionExpiredEvent);
    authEventEmitter.on("AUTH_ERROR", handleAuthErrorEvent);

    return () => {
      clearInterval(interval);
      authEventEmitter.off("SESSION_REVOKED", handleSessionRevokedEvent);
      authEventEmitter.off("SESSION_EXPIRED", handleSessionExpiredEvent);
      authEventEmitter.off("AUTH_ERROR", handleAuthErrorEvent);
    };
  }, []);

  const value: AuthContextType = {
    isLoading,
    isOnline,
    hasValidToken,
    isSessionRevoked,
    refreshAuth,
    handleRevocation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
