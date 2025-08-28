export const config = {
  // Environment: 'development' | 'production'
  environment:
    import.meta.env.VITE_ENV || import.meta.env.MODE || "development",

  // Development settings
  dev: {
    // Simulate 10% failure rate on write operations in development (for testing)
    simulateFailures: true,
    failureBoundary: 1,
    failureDelay: 2000, // 2 second delay before failure
  },

  // Testing settings
  test: {
    guaranteeFailure: false,
  },
};

export const isDevelopment = config.environment === "development";

export const isTest = config.environment === "test";

export const shouldSimulateFailure = (): boolean => {
  if (isTest && config.test.guaranteeFailure) {
    return true;
  }

  if (!isDevelopment || !config.dev.simulateFailures) {
    return false;
  }

  const random = Math.floor(Math.random() * 10) + 1;
  return random <= config.dev.failureBoundary;
};

export const getFailureDelay = (): number => {
  if (isTest && config.test.guaranteeFailure) {
    return 1000; // 1 second for tests
  }
  return config.dev.failureDelay || 2000; // Default 2 seconds
};

export const setGuaranteedFailure = (guarantee: boolean): void => {
  config.test.guaranteeFailure = guarantee;
};
