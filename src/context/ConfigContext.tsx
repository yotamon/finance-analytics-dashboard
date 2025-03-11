/**
 * ConfigContext - Application configuration management
 *
 * Provides access to the application configuration throughout the component tree
 * and allows runtime modification of configuration values
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useRef,
} from "react";
import config from "../config.env";

/**
 * Type definition for configuration values
 * This allows for various types that might be used in the config
 */
export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: ConfigValue }
  | ConfigValue[];

/**
 * Type for the configuration object
 */
export type ConfigObject = {
  [key: string]: ConfigValue;
};

// Create the Config context with appropriate typing
interface ConfigContextType {
  /**
   * Current merged configuration (default + user overrides)
   */
  config: ConfigObject;

  /**
   * User settings that override default configuration
   */
  userSettings: ConfigObject;

  /**
   * Get a configuration value using dot notation
   */
  getConfig: <T extends ConfigValue>(path: string, defaultValue?: T) => T;

  /**
   * Update a configuration value and persist to localStorage
   */
  updateConfig: (path: string, value: ConfigValue, reset?: boolean) => void;

  /**
   * Check if a feature is enabled by name
   */
  isFeatureEnabled: (featureName: string) => boolean;
}

// Storage key for user settings
const USER_SETTINGS_KEY = "finance_analyzer_user_settings";

// Create the context
const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

/**
 * Config Provider Component
 *
 * Provides access to the application configuration throughout the component tree
 * and allows runtime modification of configuration values
 */
export function ConfigProvider({ children }: ConfigProviderProps): JSX.Element {
  // Use useRef to track initialization state
  const isInitialized = useRef(false);

  // State to hold runtime configuration overrides
  const [userSettings, setUserSettings] = useState<ConfigObject>({});
  const [mergedConfig, setMergedConfig] = useState<ConfigObject>(config);

  // Load user settings from localStorage on initial render
  useEffect(() => {
    if (isInitialized.current) return;

    try {
      const savedSettings = localStorage.getItem(USER_SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setUserSettings(parsedSettings);

        // Merge default config with user settings
        setMergedConfig(deepMerge(config, parsedSettings));
      }
      isInitialized.current = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load user settings:", error);
      isInitialized.current = true;
    }
  }, []);

  // Log configuration load in development - only once after initialization
  useEffect(() => {
    if (!isInitialized.current) return;

    // Check if we're in development mode based on the merged config
    // Use a type guard to ensure we're working with a ConfigObject
    const configValue = getConfigFromMerged("app.isDev", mergedConfig);
    if (
      configValue !== null &&
      configValue !== undefined &&
      typeof configValue === "boolean" &&
      configValue
    ) {
      // eslint-disable-next-line no-console
      console.log("Configuration loaded:", {
        environment: getConfigFromMerged("app.environment", mergedConfig),
        baseConfig,
        baseSettings: mergedSettings,
      });

      if (Object.keys(userSettings).length > 0) {
        // eslint-disable-next-line no-console
        console.log("User settings applied:", userSettings);
      }
    }
  }, [mergedConfig, userSettings]);

  /**
   * Helper function to access a nested property in the merged config using dot notation
   */
  const getConfigFromMerged = <T extends ConfigValue>(
    path: string,
    configObj: ConfigObject,
    defaultValue?: T
  ): T => {
    if (!path) return configObj as unknown as T;

    const parts = path.split(".");
    let current = configObj;

    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== "object") {
        return defaultValue as T;
      }
      current = current[part];
    }

    return current !== undefined ? (current as T) : (defaultValue as T);
  };

  /**
   * Get a configuration value from the merged config (default + user settings)
   */
  const getConfigValue = <T extends ConfigValue>(path: string, defaultValue?: T): T => {
    return getConfigFromMerged<T>(path, mergedConfig, defaultValue);
  };

  /**
   * Update a configuration value at runtime and persist to localStorage
   *
   * @param path - Dot-notation path to the configuration property
   * @param value - New value to set
   * @param reset - If true, will reset all user settings
   */
  const updateConfig = (path: string, value: ConfigValue, reset = false): void => {
    if (reset) {
      // Clear all user settings
      localStorage.removeItem(USER_SETTINGS_KEY);
      setUserSettings({});
      setMergedConfig(config);
      return;
    }

    // Create a new settings object with the updated value
    const newSettings = { ...userSettings };

    // Set the value at the specified path
    setNestedValue(newSettings, path, value);

    // Save the updated settings
    setUserSettings(newSettings);
    localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(newSettings));

    // Update the merged config
    setMergedConfig(deepMerge(config, newSettings));
  };

  /**
   * Helper function to set a value at a nested path in an object
   */
  const setNestedValue = (obj: ConfigObject, path: string, value: ConfigValue): void => {
    if (!path) return;

    const parts = path.split(".");
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  };

  /**
   * Helper function to deeply merge objects
   */
  const deepMerge = (target: ConfigObject, source: ConfigObject): ConfigObject => {
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

  const isObject = (item: unknown): boolean => {
    return Boolean(item && typeof item === "object" && !Array.isArray(item));
  };

  /**
   * Check if a feature is enabled
   */
  const isFeatureEnabled = (featureName: string): boolean => {
    const path = `features.enable${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`;
    return getConfigValue<boolean>(path, false);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<ConfigContextType>(
    () => ({
      config: mergedConfig,
      userSettings,
      getConfig: getConfigValue,
      updateConfig,
      isFeatureEnabled,
    }),
    [mergedConfig, userSettings]
  );

  return <ConfigContext.Provider value={contextValue}>{children}</ConfigContext.Provider>;
}

/**
 * Hook for accessing the configuration
 *
 * @returns Configuration related methods and values
 */
export function useConfig(): ConfigContextType {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}

export default ConfigContext;
