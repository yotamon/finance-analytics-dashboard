/**
 * Configuration Utilities
 *
 * Provides helper functions for working with application configuration.
 */

import config from "../config.env";

// Storage key for user settings
const USER_SETTINGS_KEY = "finance_analyzer_user_settings";

/**
 * Get merged configuration (base config + user settings)
 *
 * @returns {object} Merged configuration
 */
const getMergedConfig = () => {
	try {
		const savedSettings = localStorage.getItem(USER_SETTINGS_KEY);
		if (savedSettings) {
			const userSettings = JSON.parse(savedSettings);
			return deepMerge(config, userSettings);
		}
	} catch (error) {
		/* eslint-disable-next-line no-console */
console.error("Failed to load user settings:", error);
	}

	return config;
};

/**
 * Get a configuration value by its path
 *
 * @param {string} path - Dot-notation path to the configuration value (e.g., 'company.name')
 * @param {any} defaultValue - Default value to return if the path doesn't exist
 * @returns {any} The configuration value or the default value
 */
export const getConfig = (path, defaultValue = undefined) => {
	// Get the merged configuration
	const mergedConfig = getMergedConfig();

	if (!path) {
		return mergedConfig;
	}

	const parts = path.split(".");
	let current = mergedConfig;

	for (const part of parts) {
		if (current === undefined || current === null || typeof current !== "object") {
			return defaultValue;
		}
		current = current[part];
	}

	return current !== undefined ? current : defaultValue;
};

/**
 * Deep merge utility function
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
 * Get company configuration
 *
 * @returns {object} Company configuration
 */
export const getCompanyConfig = () => {
	return getConfig("company");
};

/**
 * Get developer configuration
 *
 * @returns {object} Developer configuration
 */
export const getDeveloperConfig = () => {
	return getConfig("developer");
};

/**
 * Get UI theme configuration
 *
 * @returns {object} Theme configuration
 */
export const getThemeConfig = () => {
	return getConfig("ui.theme");
};

/**
 * Get application environment
 *
 * @returns {string} Current environment (development, production, etc.)
 */
export const getEnvironment = () => {
	return getConfig("app.environment");
};

/**
 * Check if the application is running in production
 *
 * @returns {boolean} True if in production
 */
export const isProduction = () => {
	return getConfig("app.isProd");
};

/**
 * Check if the application is running in development
 *
 * @returns {boolean} True if in development
 */
export const isDevelopment = () => {
	return getConfig("app.isDev");
};

/**
 * Get application API URL
 *
 * @returns {string} API URL
 */
export const getApiUrl = () => {
	return getConfig("app.apiUrl");
};

/**
 * Get feature flag status
 *
 * @param {string} featureName - Name of the feature
 * @returns {boolean} True if the feature is enabled
 */
export const isFeatureEnabled = featureName => {
	return getConfig(`features.enable${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`, false);
};

/**
 * Create a complete API endpoint URL
 *
 * @param {string} path - API endpoint path
 * @returns {string} Complete API URL
 */
export const apiEndpoint = path => {
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
 * @returns {object} Layout configuration
 */
export const getLayoutConfig = () => {
	return getConfig("ui.layout");
};

/**
 * Get application version
 *
 * @returns {string} Application version
 */
export const getAppVersion = () => {
	return getConfig("app.version");
};

/**
 * Get company name
 *
 * @returns {string} Company name
 */
export const getCompanyName = () => {
	return getConfig("company.name");
};

/**
 * Get company logo URL
 *
 * @returns {string} Logo URL
 */
export const getCompanyLogo = () => {
	return getConfig("company.logo");
};

/**
 * Get company copyright notice
 *
 * @returns {string} Copyright notice
 */
export const getCopyright = () => {
	return getConfig("company.copyright");
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
	getCopyright
};
