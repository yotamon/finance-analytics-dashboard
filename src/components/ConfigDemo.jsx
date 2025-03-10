import React from "react";
import { useConfig } from "../context/ConfigContext";
import { useUi } from "../context/UiContext";
import { getCompanyName, getCompanyLogo, getDeveloperConfig, getThemeConfig, getAppVersion } from "../utils/configUtils";

/**
 * Config Demo Component
 *
 * This component demonstrates how to use the configuration system in your components.
 * It's a great reference for new developers working on the project.
 */
const ConfigDemo = () => {
	// Method 1: Using the useConfig hook
	const { getConfig, isFeatureEnabled } = useConfig();
	// Get UI context to show current theme mode
	const { darkMode } = useUi();

	// Method 2: Using the utility functions
	const companyName = getCompanyName();
	const themeConfig = getThemeConfig();
	const appVersion = getAppVersion();
	const developerConfig = getDeveloperConfig();

	// Example of accessing nested configuration properties
	const apiUrl = getConfig("app.apiUrl");
	const primaryColor = getConfig("ui.theme.primary");

	return (
		<div className="bg-white rounded-lg shadow-md p-6 mb-6">
			<h2 className="text-xl font-bold mb-4 text-gray-800">Configuration Demo</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700">Company Details</h3>
					<div className="space-y-2">
						<p>
							<span className="font-medium">Name:</span> {companyName}
						</p>
						<p>
							<span className="font-medium">Description:</span> {getConfig("company.description")}
						</p>
						<p>
							<span className="font-medium">Website:</span> {getConfig("company.website")}
						</p>
						<p>
							<span className="font-medium">Contact:</span> {getConfig("company.contactEmail")}
						</p>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700">App Settings</h3>
					<div className="space-y-2">
						<p>
							<span className="font-medium">Version:</span> {appVersion}
						</p>
						<p>
							<span className="font-medium">Environment:</span> {getConfig("app.environment")}
						</p>
						<p>
							<span className="font-medium">API URL:</span> {apiUrl}
						</p>
						<p>
							<span className="font-medium">Theme Mode:</span>{" "}
							<span className={`${darkMode ? "bg-gray-700 text-white" : "bg-gray-200"} px-2 py-1 rounded text-xs font-medium`}>{darkMode ? "Dark Mode" : "Light Mode"}</span>
						</p>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700">Feature Flags</h3>
					<div className="space-y-2">
						<div className="flex items-center">
							<div className={`w-3 h-3 rounded-full mr-2 ${isFeatureEnabled("DataExport") ? "bg-green-500" : "bg-red-500"}`}></div>
							<p>Data Export: {isFeatureEnabled("DataExport") ? "Enabled" : "Disabled"}</p>
						</div>
						<div className="flex items-center">
							<div className={`w-3 h-3 rounded-full mr-2 ${isFeatureEnabled("DataImport") ? "bg-green-500" : "bg-red-500"}`}></div>
							<p>Data Import: {isFeatureEnabled("DataImport") ? "Enabled" : "Disabled"}</p>
						</div>
						<div className="flex items-center">
							<div className={`w-3 h-3 rounded-full mr-2 ${isFeatureEnabled("Charting") ? "bg-green-500" : "bg-red-500"}`}></div>
							<p>Charting: {isFeatureEnabled("Charting") ? "Enabled" : "Disabled"}</p>
						</div>
						<div className="flex items-center">
							<div className={`w-3 h-3 rounded-full mr-2 ${isFeatureEnabled("Reporting") ? "bg-green-500" : "bg-red-500"}`}></div>
							<p>Reporting: {isFeatureEnabled("Reporting") ? "Enabled" : "Disabled"}</p>
						</div>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700">Theme Colors</h3>
					<div className="grid grid-cols-2 gap-2">
						<div className="flex items-center">
							<div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: primaryColor || themeConfig.primary }}></div>
							<p>Primary</p>
						</div>
						<div className="flex items-center">
							<div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: themeConfig.secondary }}></div>
							<p>Secondary</p>
						</div>
						<div className="flex items-center">
							<div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: themeConfig.accent }}></div>
							<p>Accent</p>
						</div>
						<div className="flex items-center">
							<div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: themeConfig.error }}></div>
							<p>Error</p>
						</div>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-2 text-gray-700">Storage Information</h3>
					<div className="space-y-2">
						<p>
							<span className="font-medium">Storage Key:</span> finance_analyzer_user_settings
						</p>
						<p>
							<span className="font-medium">Storage Type:</span> localStorage
						</p>
						<p className="mt-3 text-xs text-gray-500">
							Your settings are stored in the browser's localStorage and will persist across sessions. You can view or modify these settings via the Settings page.
						</p>
					</div>
				</div>
			</div>

			<div className="mt-6 pt-4 border-t border-gray-100">
				<h3 className="text-lg font-semibold mb-2 text-gray-700">Developer Info</h3>
				<p>
					<span className="font-medium">Developer:</span> {developerConfig.name}
				</p>
				<p>
					<span className="font-medium">Contact:</span> {developerConfig.email}
				</p>
				<p>
					<span className="font-medium">Repository:</span> {developerConfig.repository}
				</p>
			</div>
		</div>
	);
};

export default ConfigDemo;
