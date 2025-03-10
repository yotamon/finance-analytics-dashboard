# Configuration System Guide

## Overview

This document explains how to use the configuration system in the Finance Analyzer application. The configuration system provides a centralized way to manage all application settings, including company details, developer information, feature flags, UI settings, and more.

## Configuration Files

The configuration system consists of three main files:

1. **`src/config.js`**: Contains all default configuration values.
2. **`src/config.env.js`**: Contains environment-specific overrides for different environments (development, production, staging).
3. **`src/utils/configUtils.js`**: Utility functions for accessing configuration values throughout the application.

## Runtime Settings

The application includes a **Settings page** that allows users to modify configuration values at runtime without editing code or restarting the application. These settings are persisted in the browser's localStorage.

To access the Settings page, click on the "Settings" link in the application header. You can modify:

- **Company Details**: Name, tagline, description, contact info, etc.
- **Feature Flags**: Enable or disable specific features
- **UI Settings**: Theme colors, default theme (light/dark), etc.

Whenever you change a setting, it will override the default configuration value for your browser session and will persist across page reloads. You can reset to default values at any time using the "Reset to Defaults" button on the Settings page.

## Environment Variables

Since this project uses Vite, environment variables are accessed through `import.meta.env` instead of `process.env`. To use environment variables in your project:

1. Create a `.env` file at the root of your project:

   ```
   VITE_API_URL=https://your-api.com
   VITE_BASE_URL=https://your-site.com
   ```

2. All variables must be prefixed with `VITE_` to be exposed to your code.

3. Access them in your code via `import.meta.env.VITE_VARIABLE_NAME`

4. Different environments can use different `.env` files:
   - `.env` - loaded in all environments
   - `.env.development` - only loaded in development
   - `.env.production` - only loaded in production

## How to Modify Configuration

### Default Configuration

To modify the default configuration, you can:

1. **Edit configuration files** (for developers):

   - Modify `src/config.js` for base settings
   - Modify `src/config.env.js` for environment-specific settings
   - Set environment variables in `.env` files

2. **Use the Settings page** (for users):
   - Navigate to the Settings page in the application
   - Modify settings through the user interface
   - Changes will be persisted in localStorage

### Company Details

To update company information in the config file, modify the `company` section in `src/config.js`:

```javascript
company: {
  name: "Your Company Name",
  logo: "/path/to/your/logo.png",
  favicon: "/favicon.ico",
  tagline: "Your company tagline",
  description: "A brief description of your company",
  contactEmail: "contact@yourcompany.com",
  website: "https://yourcompany.com",
  copyright: `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
  socialMedia: {
    twitter: "https://twitter.com/yourcompany",
    linkedin: "https://linkedin.com/company/yourcompany",
    github: "https://github.com/yourcompany",
  },
}
```

### Developer Information

Update developer information in the `developer` section:

```javascript
developer: {
  name: "Your Name",
  email: "developer@example.com",
  website: "https://yourwebsite.com",
  repository: "https://github.com/yourusername/finance-analyzer",
}
```

### Feature Flags

Enable or disable features by modifying the `features` section:

```javascript
features: {
  enableDataExport: true,  // Set to false to disable data export
  enableDataImport: true,  // Set to false to disable data import
  enableCharting: true,    // Set to false to disable charting
  // ... other features
}
```

### Theme and UI Settings

Customize UI appearance by modifying the `ui` section:

```javascript
ui: {
  theme: {
    primary: "#3b82f6",    // Primary color
    secondary: "#10b981",  // Secondary color
    // ... other colors
  },
  layout: {
    sidebarWidth: 250,     // Sidebar width in pixels
    topbarHeight: 64,      // Top bar height in pixels
    // ... other layout settings
  },
  // ... other UI settings
}
```

## Accessing Configuration in Components

### Method 1: Using the `useConfig` Hook

```jsx
import { useConfig } from "../context/ConfigContext";

function MyComponent() {
	const { getConfig, isFeatureEnabled, updateConfig } = useConfig();

	// Get a specific config value
	const apiUrl = getConfig("app.apiUrl");

	// Check if a feature is enabled
	const canExportData = isFeatureEnabled("DataExport");

	// Update a config value at runtime
	const updateCompanyName = () => {
		updateConfig("company.name", "New Company Name");
	};

	return (
		<div>
			<p>API URL: {apiUrl}</p>
			{canExportData && <button>Export Data</button>}
			<button onClick={updateCompanyName}>Update Company Name</button>
		</div>
	);
}
```

### Method 2: Using Utility Functions

```jsx
import { getCompanyName, getThemeConfig, getApiUrl } from "../utils/configUtils";

function MyComponent() {
	const companyName = getCompanyName();
	const theme = getThemeConfig();
	const apiUrl = getApiUrl();

	return (
		<div style={{ color: theme.primary }}>
			<h1>{companyName}</h1>
			<p>API URL: {apiUrl}</p>
		</div>
	);
}
```

## Configuration Demo Component

For a practical example of how to use the configuration system, refer to:

1. `src/components/ConfigDemo.jsx` - Demonstrates various ways to access configuration values
2. `src/pages/Settings.jsx` - Shows how to modify configuration at runtime

## Best Practices

1. **Don't hardcode values** that might need to change. Always use the configuration system.
2. **Use feature flags** for functionality that might need to be enabled/disabled.
3. **Keep sensitive information** out of the configuration files and use environment variables instead.
4. **Provide fallback values** when accessing configuration to ensure your app doesn't break if a value is missing.
5. **Use the environment-specific configuration** for values that differ between environments.
6. **Use the Settings page** for user-facing configuration that can change at runtime.

## Adding New Configuration Settings

To add new configuration settings:

1. Add the default value to the appropriate section in `src/config.js`.
2. If needed, add environment-specific overrides in `src/config.env.js`.
3. If it's a commonly accessed setting, consider adding a utility function in `src/utils/configUtils.js`.
4. If it's a setting that users should be able to modify, add it to the Settings page in `src/pages/Settings.jsx`.

## Configuration Precedence

Configuration values are resolved in the following order (highest priority first):

1. Runtime user settings from the Settings page (stored in localStorage)
2. Environment variables (`import.meta.env.VITE_*`)
3. Environment-specific config from `config.env.js`
4. Default config from `config.js`

## Troubleshooting

If you're having issues with the configuration system:

1. Check the browser console for any errors related to configuration loading.
2. Verify that you're using the correct path when accessing nested configuration values.
3. Check localStorage for any saved user settings (in DevTools under Application > Storage > Local Storage).
4. Make sure you're using `useConfig()` within a component that's a child of `ConfigProvider` in the component tree.
5. If settings aren't persisting, ensure localStorage is enabled in your browser.
6. Try using the "Reset to Defaults" button on the Settings page to clear any problematic settings.
