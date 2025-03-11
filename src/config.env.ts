/**
 * Environment-specific configuration
 *
 * This file contains environment-specific overrides for the configuration.
 * Values here will override the default values in config.js.
 *
 * You can create different environment files:
 * - config.env.development.js
 * - config.env.production.js
 * - config.env.staging.js
 */

// Import the default configuration
import defaultConfig from "./config";

// For Vite, use import.meta.env instead of process.env
const NODE_ENV = import.meta.env.MODE || "development";

// Environment-specific configuration overrides
const envConfig: Record<string, Record<string, any>> = {
  development: {
    app: {
      apiUrl: "http://localhost:3000/api",
      baseUrl: "http://localhost:5173",
    },
    logging: {
      level: "debug",
      console: true,
      file: false,
      remote: false,
    },
    errorReporting: {
      enabled: false,
    },
    performance: {
      sampleRate: 1.0, // Capture all events in development
    },
  },

  production: {
    app: {
      apiUrl: "https://api.example.com",
      baseUrl: "https://example.com",
    },
    logging: {
      level: "error",
      console: false,
      file: true,
      remote: true,
    },
    errorReporting: {
      enabled: true,
    },
    cache: {
      ttl: 7200, // 2 hours in production
    },
  },

  staging: {
    app: {
      apiUrl: "https://staging-api.example.com",
      baseUrl: "https://staging.example.com",
    },
    logging: {
      level: "warn",
      console: true,
      file: true,
      remote: true,
    },
    errorReporting: {
      enabled: true,
    },
  },
};

// Determine the current environment
const environment = NODE_ENV;

// Get environment-specific overrides
const currentEnvConfig = envConfig[environment] || envConfig.development;

// Helper function to deeply merge objects
const deepMerge = <T extends Record<string, any>, U extends Record<string, any>>(
  target: T,
  source: U
): Record<string, any> => {
  const output = { ...target } as Record<string, any>;

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
};

// Helper function to check if a value is an object
const isObject = (item: any): item is Record<string, any> => {
  return item && typeof item === "object" && !Array.isArray(item);
};

// Merge the default config with environment-specific overrides
const config = deepMerge(defaultConfig, currentEnvConfig);

export default config;
