import { createContext, useContext, useEffect, useState } from "react";
import config from "../config.env";
import { getConfig as getConfigUtil } from "../utils/configUtils";

// Create the Config context
const ConfigContext = createContext();

// Storage key for user settings
const USER_SETTINGS_KEY = "finance_analyzer_user_settings";

/**
 * Config Provider Component
 *
 * Provides access to the application configuration throughout the component tree
 * and allows runtime modification of configuration values
 */
export function ConfigProvider({ children }) {
	// State to hold runtime configuration overrides
	const [userSettings, setUserSettings] = useState({});
	const [mergedConfig, setMergedConfig] = useState(config);

	// Load user settings from localStorage on initial render
	useEffect(() => {
		try {
			const savedSettings = localStorage.getItem(USER_SETTINGS_KEY);
			if (savedSettings) {
				const parsedSettings = JSON.parse(savedSettings);
				setUserSettings(parsedSettings);

				// Merge default config with user settings
				setMergedConfig(deepMerge(config, parsedSettings));
			}
		} catch (error) {
			console.error("Failed to load user settings:", error);
		}
	}, []);

	// Log configuration load in development
	useEffect(() => {
		if (getConfigFromMerged("app.isDev", mergedConfig)) {
			console.log("Configuration loaded:", {
				environment: getConfigFromMerged("app.environment", mergedConfig),
				appName: getConfigFromMerged("app.name", mergedConfig),
				version: getConfigFromMerged("app.version", mergedConfig)
			});

			if (Object.keys(userSettings).length > 0) {
				console.log("User settings applied:", userSettings);
			}
		}
	}, [mergedConfig, userSettings]);

	/**
	 * Helper function to access a nested property in the merged config using a dot-notation path
	 */
	const getConfigFromMerged = (path, config, defaultValue) => {
		if (!path) return config;

		const parts = path.split(".");
		let current = config;

		for (const part of parts) {
			if (current === undefined || current === null || typeof current !== "object") {
				return defaultValue;
			}
			current = current[part];
		}

		return current !== undefined ? current : defaultValue;
	};

	/**
	 * Get a configuration value from the merged config (default + user settings)
	 */
	const getConfigValue = (path, defaultValue) => {
		return getConfigFromMerged(path, mergedConfig, defaultValue);
	};

	/**
	 * Update a configuration value at runtime and persist to localStorage
	 *
	 * @param {string} path - Dot-notation path to the configuration property
	 * @param {any} value - New value to set
	 * @param {boolean} reset - If true, will reset all user settings
	 */
	const updateConfig = (path, value, reset = false) => {
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
	const setNestedValue = (obj, path, value) => {
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
	const deepMerge = (target, source) => {
		const output = { ...target };

		if (isObject(target) && isObject(source)) {
			Object.keys(source).forEach(key => {
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

	const isObject = item => {
		return item && typeof item === "object" && !Array.isArray(item);
	};

	/**
	 * Check if a feature is enabled
	 */
	const isFeatureEnabled = featureName => {
		const path = `features.enable${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`;
		return getConfigValue(path, false);
	};

	const value = {
		config: mergedConfig,
		userSettings,
		getConfig: getConfigValue,
		updateConfig,
		isFeatureEnabled
	};

	return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

/**
 * Hook for accessing the configuration
 *
 * @returns {object} Configuration related methods and values
 */
export function useConfig() {
	const context = useContext(ConfigContext);
	if (!context) {
		throw new Error("useConfig must be used within a ConfigProvider");
	}
	return context;
}

export default ConfigContext;
