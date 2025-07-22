import { Image } from "expo-image";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/contexts/AuthProvider";
import {
  getGuestSessionToken,
  refreshTokenIfNeeded,
  validateSessionWithServer,
  getNetworkStatus,
  clearAuthData,
  authEventEmitter,
} from "@/lib/auth";

export default function HomeScreen() {
  const {
    isLoading,
    isOnline,
    hasValidToken,
    isSessionRevoked,
    refreshAuth,
    handleRevocation,
  } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth events
    const handleAuthEvent = (eventData: any) => {
      setTestResults((prev) => [
        ...prev,
        `🔥 Event: ${JSON.stringify(eventData)}`,
      ]);
    };

    authEventEmitter.on("SESSION_REVOKED", handleAuthEvent);
    authEventEmitter.on("SESSION_EXPIRED", handleAuthEvent);
    authEventEmitter.on("AUTH_ERROR", handleAuthEvent);

    return () => {
      authEventEmitter.off("SESSION_REVOKED", handleAuthEvent);
      authEventEmitter.off("SESSION_EXPIRED", handleAuthEvent);
      authEventEmitter.off("AUTH_ERROR", handleAuthEvent);
    };
  }, []);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testGetToken = async () => {
    try {
      addTestResult("🔄 Testing token generation...");
      const token = await getGuestSessionToken();
      if (token) {
        setCurrentToken(token.substring(0, 20) + "...");
        addTestResult("✅ Token generated successfully");
      } else {
        addTestResult("❌ Token generation failed");
      }
    } catch (error: any) {
      addTestResult(`❌ Error: ${error.message}`);
    }
  };

  const testRefreshToken = async () => {
    try {
      addTestResult("🔄 Testing token refresh...");
      const token = await refreshTokenIfNeeded();
      if (token) {
        setCurrentToken(token.substring(0, 20) + "...");
        addTestResult("✅ Token refreshed successfully");
      } else {
        addTestResult("❌ Token refresh failed");
      }
    } catch (error: any) {
      addTestResult(`❌ Refresh error: ${error.message}`);
    }
  };

  const testForceRefresh = async () => {
    try {
      addTestResult("🔄 Testing force refresh...");
      const token = await getGuestSessionToken(true);
      if (token) {
        setCurrentToken(token.substring(0, 20) + "...");
        addTestResult("✅ Force refresh successful");
      } else {
        addTestResult("❌ Force refresh failed");
      }
    } catch (error: any) {
      addTestResult(`❌ Force refresh error: ${error.message}`);
    }
  };

  const testValidateSession = async () => {
    try {
      addTestResult("🔄 Validating session with server...");
      const result = await validateSessionWithServer();
      addTestResult(
        `📊 Validation: Valid=${result.isValid}, Revoked=${result.isRevoked}`
      );
      if (result.reason) {
        addTestResult(`📝 Reason: ${result.reason}`);
      }
    } catch (error: any) {
      addTestResult(`❌ Validation error: ${error.message}`);
    }
  };

  const testNetworkStatus = async () => {
    try {
      addTestResult("🔄 Checking network status...");
      const isOnline = await getNetworkStatus();
      addTestResult(`🌐 Network: ${isOnline ? "Online" : "Offline"}`);
    } catch (error: any) {
      addTestResult(`❌ Network check error: ${error.message}`);
    }
  };

  const testClearAuth = async () => {
    try {
      addTestResult("🔄 Clearing auth data...");
      await clearAuthData();
      setCurrentToken(null);
      addTestResult("✅ Auth data cleared");
    } catch (error: any) {
      addTestResult(`❌ Clear auth error: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const TestButton = ({
    title,
    onPress,
    style = {},
  }: {
    title: string;
    onPress: () => void;
    style?: any;
  }) => (
    <TouchableOpacity style={[styles.testButton, style]} onPress={onPress}>
      <ThemedText style={styles.testButtonText}>{title}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.authStatusContainer}>
        <ThemedText type='title'>🔐 Auth System Test</ThemedText>

        <ThemedView style={styles.statusGrid}>
          <ThemedView style={styles.statusItem}>
            <ThemedText style={styles.statusLabel}>Loading:</ThemedText>
            <ThemedText
              style={[
                styles.statusValue,
                isLoading ? styles.statusLoading : styles.statusSuccess,
              ]}
            >
              {isLoading ? "Yes" : "No"}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.statusItem}>
            <ThemedText style={styles.statusLabel}>Online:</ThemedText>
            <ThemedText
              style={[
                styles.statusValue,
                isOnline ? styles.statusSuccess : styles.statusError,
              ]}
            >
              {isOnline ? "Yes" : "No"}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.statusItem}>
            <ThemedText style={styles.statusLabel}>Valid Token:</ThemedText>
            <ThemedText
              style={[
                styles.statusValue,
                hasValidToken ? styles.statusSuccess : styles.statusError,
              ]}
            >
              {hasValidToken ? "Yes" : "No"}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.statusItem}>
            <ThemedText style={styles.statusLabel}>Revoked:</ThemedText>
            <ThemedText
              style={[
                styles.statusValue,
                isSessionRevoked ? styles.statusError : styles.statusSuccess,
              ]}
            >
              {isSessionRevoked ? "Yes" : "No"}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {currentToken && (
          <ThemedView style={styles.tokenContainer}>
            <ThemedText style={styles.tokenLabel}>Current Token:</ThemedText>
            <ThemedText style={styles.tokenValue}>{currentToken}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.testButtonsContainer}>
        <ThemedText type='subtitle'>🧪 Test Functions</ThemedText>

        <ThemedView style={styles.buttonGrid}>
          <TestButton title='Get Token' onPress={testGetToken} />
          <TestButton title='Refresh Token' onPress={testRefreshToken} />
          <TestButton title='Force Refresh' onPress={testForceRefresh} />
          <TestButton title='Validate Session' onPress={testValidateSession} />
          <TestButton title='Network Status' onPress={testNetworkStatus} />
          <TestButton
            title='Clear Auth'
            onPress={testClearAuth}
            style={styles.dangerButton}
          />
        </ThemedView>

        <ThemedView style={styles.contextButtonsContainer}>
          <TestButton title='Refresh Auth Context' onPress={refreshAuth} />
          {isSessionRevoked && (
            <TestButton
              title='Handle Revocation'
              onPress={handleRevocation}
              style={styles.warningButton}
            />
          )}
          <TestButton
            title='Clear Results'
            onPress={clearResults}
            style={styles.clearButton}
          />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.resultsContainer}>
        <ThemedText type='subtitle'>📋 Test Results</ThemedText>
        {testResults.length === 0 ? (
          <ThemedText style={styles.noResults}>
            No test results yet. Try running some tests!
          </ThemedText>
        ) : (
          testResults.map((result, index) => (
            <ThemedView key={index} style={styles.resultItem}>
              <ThemedText style={styles.resultText}>{result}</ThemedText>
            </ThemedView>
          ))
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  authStatusContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: "45%",
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statusSuccess: {
    color: "#22c55e",
  },
  statusError: {
    color: "#ef4444",
  },
  statusLoading: {
    color: "#f59e0b",
  },
  tokenContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#374151",
  },
  testButtonsContainer: {
    marginBottom: 20,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  contextButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  testButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
  },
  testButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  dangerButton: {
    backgroundColor: "#ef4444",
  },
  warningButton: {
    backgroundColor: "#f59e0b",
  },
  clearButton: {
    backgroundColor: "#6b7280",
  },
  resultsContainer: {
    marginBottom: 20,
  },
  noResults: {
    fontStyle: "italic",
    color: "#6b7280",
    textAlign: "center",
    marginTop: 10,
  },
  resultItem: {
    backgroundColor: "#f9fafb",
    padding: 8,
    marginTop: 4,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  resultText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
