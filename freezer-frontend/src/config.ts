// Environment configuration
export const config = {
  // Environment: 'development' | 'production'
  environment:
    import.meta.env.VITE_ENV || import.meta.env.MODE || "development",

  // Development settings
  dev: {
    // Simulate 10% failure rate on write operations in development
    simulateFailures: true,
    failureRate: 0.1, // 10%
  },

  // Testing settings
  test: {
    // Force failures for testing (set to true in tests that need guaranteed failures)
    guaranteeFailure: false,
  },
};

// Helper to check if we're in development
export const isDevelopment = config.environment === "development";

// Helper to check if we're in test environment
export const isTest = config.environment === "test";

// Helper to simulate failure
export const shouldSimulateFailure = (): boolean => {
  // In test environment, check for guaranteed failure first
  if (isTest && config.test.guaranteeFailure) {
    return true;
  }

  if (!isDevelopment || !config.dev.simulateFailures) {
    return false;
  }

  // Generate random number 1-10, return true if it's 10 (10% chance)
  const random = Math.floor(Math.random() * 10) + 1;
  return random === 10;
};

// Helper to set guaranteed failure for testing
export const setGuaranteedFailure = (guarantee: boolean): void => {
  config.test.guaranteeFailure = guarantee;
};
