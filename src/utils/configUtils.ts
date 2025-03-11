/**
 * Configuration Utilities
 *
 * Provides helper functions for working with application configuration.
 */

import config from "../config.env";
import { AppConfig } from "@/types/config-types";

// Storage key for user settings
const USER_SETTINGS_KEY = "finance_analyzer_user_settings";

/**
 * Get merged configuration (base config + user settings)
 *
 * @returns Merged configuration
 */
const getMergedConfig = (): Record<string, any> => {
  try {
    const savedSettings = localStorage.getItem(USER_SETTINGS_KEY);
    if (savedSettings) {
      const userSettings = JSON.parse(savedSettings);
      return deepMerge(config, userSettings);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to load user settings:", error);
  }

  return config;
};

/**
 * Get a configuration value by its path
 *
 * @param path - Dot-notation path to the configuration value (e.g., 'company.name')
 * @param defaultValue - Default value to return if the path doesn't exist
 * @returns The configuration value or the default value
 */
export const getConfig = <T>(path?: string, defaultValue?: T): T => {
  // Get the merged configuration
  const mergedConfig = getMergedConfig();

  if (!path) {
    return mergedConfig as T;
  }

  const parts = path.split(".");
  let current: any = mergedConfig;

  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== "object") {
      return defaultValue as T;
    }
    current = current[part];
  }

  return current !== undefined ? (current as T) : (defaultValue as T);
};

/**
 * Deep merge utility function
 */
const deepMerge = (
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> => {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
};

/**
 * Check if a value is a non-array object
 */
const isObject = (item: any): boolean => {
  return item && typeof item === "object" && !Array.isArray(item);
};

/**
 * Get company configuration
 *
 * @returns Company configuration
 */
export const getCompanyConfig = (): Record<string, any> => {
  return getConfig<Record<string, any>>("company", {});
};

/**
 * Get developer configuration
 *
 * @returns Developer configuration
 */
export const getDeveloperConfig = (): Record<string, any> => {
  return getConfig<Record<string, any>>("developer", {});
};

/**
 * Get UI theme configuration
 *
 * @returns Theme configuration
 */
export const getThemeConfig = (): Record<string, any> => {
  return getConfig<Record<string, any>>("ui.theme", {});
};

/**
 * Get application environment
 *
 * @returns Current environment (development, production, etc.)
 */
export const getEnvironment = (): string => {
  return getConfig<string>("app.environment", "development");
};

/**
 * Check if the application is running in production
 *
 * @returns True if in production
 */
export const isProduction = (): boolean => {
  return getConfig<boolean>("app.isProd", false);
};

/**
 * Check if the application is running in development
 *
 * @returns True if in development
 */
export const isDevelopment = (): boolean => {
  return getConfig<boolean>("app.isDev", true);
};

/**
 * Get application API URL
 *
 * @returns API URL
 */
export const getApiUrl = (): string => {
  return getConfig<string>("app.apiUrl", "");
};

/**
 * Get feature flag status
 *
 * @param featureName - Name of the feature
 * @returns True if the feature is enabled
 */
export const isFeatureEnabled = (featureName: string): boolean => {
  return getConfig<boolean>(
    `features.enable${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`,
    false
  );
};

/**
 * Create a complete API endpoint URL
 *
 * @param path - API endpoint path
 * @returns Complete API URL
 */
export const apiEndpoint = (path?: string): string => {
  const apiUrl = getApiUrl();
  if (!path) return apiUrl;

  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Add trailing slash to apiUrl if it doesn't have one and cleanPath is not empty
  if (apiUrl.endsWith("/") || cleanPath === "") {
    return `${apiUrl}${cleanPath}`;
  }

  return `${apiUrl}/${cleanPath}`;
};

/**
 * Get UI layout configuration
 *
 * @returns Layout configuration
 */
export const getLayoutConfig = (): Record<string, any> => {
  return getConfig<Record<string, any>>("ui.layout", {});
};

/**
 * Get application version
 *
 * @returns Application version
 */
export const getAppVersion = (): string => {
  return getConfig<string>("app.version", "0.0.0");
};

/**
 * Get company name
 *
 * @returns Company name
 */
export const getCompanyName = (): string => {
  return getConfig<string>("company.name", "");
};

/**
 * Get company logo URL
 *
 * @returns Logo URL
 */
export const getCompanyLogo = (): string => {
  return getConfig<string>("company.logo", "");
};

/**
 * Get company copyright notice
 *
 * @returns Copyright notice
 */
export const getCopyright = (): string => {
  return getConfig<string>("company.copyright", "");
};

export default {
  getConfig,
  getCompanyConfig,
  getDeveloperConfig,
  getThemeConfig,
  getEnvironment,
  isProduction,
  isDevelopment,
  getApiUrl,
  isFeatureEnabled,
  apiEndpoint,
  getLayoutConfig,
  getAppVersion,
  getCompanyName,
  getCompanyLogo,
  getCopyright,
};
