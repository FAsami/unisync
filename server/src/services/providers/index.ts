import { NotificationProvider } from "../../types/notificationProvider";
import { FCMProvider } from "./FCMProvider";
// Import other providers here in the future
// import { OneSignalProvider } from "./OneSignalProvider";
// import { PusherProvider } from "./PusherProvider";

/**
 * Provider Registry
 * Centralized management of notification providers
 */
class ProviderRegistry {
  private providers: NotificationProvider[] = [];

  constructor() {
    // Register all available providers
    this.registerProvider(new FCMProvider());
    // this.registerProvider(new OneSignalProvider());
    // this.registerProvider(new PusherProvider());
  }

  private registerProvider(provider: NotificationProvider) {
    if (provider.isAvailable()) {
      this.providers.push(provider);
    }
  }

  /**
   * Get all active providers
   */
  getProviders(): NotificationProvider[] {
    return this.providers.filter((p) => p.isAvailable());
  }

  /**
   * Get a specific provider by name
   */
  getProvider(name: string): NotificationProvider | undefined {
    return this.providers.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Get the primary provider (first available)
   */
  getPrimaryProvider(): NotificationProvider | undefined {
    return this.providers[0];
  }
}

export const providerRegistry = new ProviderRegistry();
