import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Globe,
  DollarSign,
  Palette,
  RotateCcw,
} from "lucide-react";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import { useConfig } from "../context/ConfigContext";
import { useI18n } from "../context/I18nContext";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import Text from "../design-system/components/Text";

// Define interfaces for our state types
interface CompanySettings {
  name: string;
  tagline: string;
  description: string;
  contactEmail: string;
  website: string;
}

interface FeatureFlags {
  enableDataExport: boolean;
  enableDataImport: boolean;
  enableCharting: boolean;
  enableReporting: boolean;
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  enableSubscriptions: boolean;
  [key: string]: boolean;
}

interface LocaleSettings {
  language: string;
  currency: string;
}

interface ColorSettings {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  [key: string]: string;
}

interface TestResultData {
  setting: string;
  value: any;
  success: boolean;
}

interface FeatureDescriptions {
  [key: string]: string;
}

const Settings: React.FC = () => {
  const { getConfig, updateConfig } = useConfig();
  const { currentLanguage, changeLanguage, availableLanguages, t } = useI18n();
  const { currency, changeCurrency, availableCurrencies, fetchExchangeRates } = useCurrency();
  const { currentTheme, updateThemeColors, resetThemeColors } = useTheme();
  const navigate = useNavigate();
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResultData | null>(null);

  // Company settings
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: getConfig("company.name", ""),
    tagline: getConfig("company.tagline", ""),
    description: getConfig("company.description", ""),
    contactEmail: getConfig("company.contactEmail", ""),
    website: getConfig("company.website", ""),
  });

  // Feature flags
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    enableDataExport: getConfig("features.enableDataExport", false),
    enableDataImport: getConfig("features.enableDataImport", true),
    enableCharting: getConfig("features.enableCharting", true),
    enableReporting: getConfig("features.enableReporting", true),
    enableNotifications: getConfig("features.enableNotifications", true),
    enableOfflineMode: getConfig("features.enableOfflineMode", true),
    enableSubscriptions: getConfig("features.enableSubscriptions", false),
  });

  // Locale settings
  const [localeSettings, setLocaleSettings] = useState<LocaleSettings>({
    language: currentLanguage,
    currency: currency.code,
  });

  // Color settings
  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    primary: getConfig("theme.colors.primary", "#6366f1"),
    secondary: getConfig("theme.colors.secondary", "#6b7280"),
    success: getConfig("theme.colors.success", "#10b981"),
    warning: getConfig("theme.colors.warning", "#f59e0b"),
    error: getConfig("theme.colors.error", "#ef4444"),
  });

  // Update state if config changes externally
  useEffect(() => {
    setCompanySettings({
      name: getConfig("company.name", ""),
      tagline: getConfig("company.tagline", ""),
      description: getConfig("company.description", ""),
      contactEmail: getConfig("company.contactEmail", ""),
      website: getConfig("company.website", ""),
    });

    setFeatureFlags({
      enableDataExport: getConfig("features.enableDataExport", false),
      enableDataImport: getConfig("features.enableDataImport", true),
      enableCharting: getConfig("features.enableCharting", true),
      enableReporting: getConfig("features.enableReporting", true),
      enableNotifications: getConfig("features.enableNotifications", true),
      enableOfflineMode: getConfig("features.enableOfflineMode", true),
      enableSubscriptions: getConfig("features.enableSubscriptions", false),
    });

    setLocaleSettings({
      language: currentLanguage,
      currency: currency.code,
    });
  }, [getConfig, currentLanguage, currency.code]);

  // Handle company settings changes
  const handleCompanyChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanySettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle feature flag toggle
  const handleFeatureToggle = (feature: keyof FeatureFlags) => {
    setFeatureFlags((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  // Handle locale settings changes
  const handleLocaleChange = (setting: keyof LocaleSettings, value: string) => {
    setLocaleSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));

    // Apply changes immediately
    if (setting === "language") {
      changeLanguage(value);
    } else if (setting === "currency") {
      changeCurrency(value);
    }
  };

  // Test a specific configuration value to verify settings are working
  const testConfiguration = () => {
    const currentSetting = getConfig("company.name");
    setTestResult({
      setting: "company.name",
      value: currentSetting,
      success: true,
    });

    // Clear test result after 5 seconds
    setTimeout(() => {
      setTestResult(null);
    }, 5000);
  };

  // Update color settings state
  const handleColorChange = (colorName: keyof ColorSettings, value: string) => {
    setColorSettings((prev) => ({
      ...prev,
      [colorName]: value,
    }));
  };

  // Apply color changes preview
  const applyColorChanges = () => {
    updateThemeColors(colorSettings);
  };

  // Reset colors to defaults
  const handleResetColors = () => {
    if (
      window.confirm("Are you sure you want to reset all colors to default? This cannot be undone.")
    ) {
      resetThemeColors();
      // Update our local state with the reset values
      setColorSettings({
        primary: getConfig("theme.colors.primary", "#6366f1"),
        secondary: getConfig("theme.colors.secondary", "#6b7280"),
        success: getConfig("theme.colors.success", "#10b981"),
        warning: getConfig("theme.colors.warning", "#f59e0b"),
        error: getConfig("theme.colors.error", "#ef4444"),
      });
    }
  };

  // Save all settings
  const saveSettings = () => {
    try {
      // Update company settings
      Object.entries(companySettings).forEach(([key, value]) => {
        updateConfig(`company.${key}`, value);
      });

      // Update feature flags
      Object.entries(featureFlags).forEach(([key, value]) => {
        updateConfig(`features.${key}`, value);
      });

      // Update locale settings
      updateConfig("app.language", localeSettings.language);
      updateConfig("app.currency", localeSettings.currency);

      // Update color settings
      Object.entries(colorSettings).forEach(([key, value]) => {
        updateConfig(`theme.colors.${key}`, value);
      });

      // Apply the color changes
      updateThemeColors(colorSettings);

      // Show success message
      setSuccess(true);
      setError(null);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to save settings: ${errorMessage}`);
      setSuccess(false);
    }
  };

  // Reset to default settings
  const resetSettings = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all settings to defaults? This cannot be undone."
      )
    ) {
      try {
        updateConfig(null, null, true); // Pass true to reset all settings

        // Reload the page to reflect changes
        window.location.reload();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError("Failed to reset settings: " + errorMessage);
      }
    }
  };

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t("settings.title")}</h1>

        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center text-green-800">
            <Check size={18} className="mr-2 text-green-600" />
            Settings saved successfully!
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-800">
            <X size={18} className="mr-2 text-red-600" />
            {error}
          </div>
        )}

        {/* Test result */}
        {testResult && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            <div className="font-medium mb-1">Configuration Test Result:</div>
            <div className="flex items-center">
              <AlertCircle size={18} className="mr-2 text-blue-600" />
              <span>
                Setting <code className="bg-blue-100 px-1 rounded">{testResult.setting}</code> has
                value:{" "}
                <code className="bg-blue-100 px-1 rounded">{JSON.stringify(testResult.value)}</code>
              </span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Locale Settings */}
          <div className="bg-[rgb(var(--bg-tertiary))] rounded-lg shadow-sm border border-[rgb(var(--border-light))] p-6">
            <h2 className="text-xl font-semibold mb-4 text-[rgb(var(--text-primary))]">
              Localization
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language setting */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                  <div className="flex items-center">
                    <Globe size={16} className="mr-2" />
                    {t("settings.language")}
                  </div>
                </label>
                <select
                  value={localeSettings.language}
                  onChange={(e) => handleLocaleChange("language", e.target.value)}
                  className="w-full p-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] rounded-md focus:ring-2 focus:ring-[rgb(var(--color-primary-500))] focus:border-[rgb(var(--color-primary-500))] text-[rgb(var(--text-primary))]"
                >
                  {Object.entries(availableLanguages).map(([code, details]) => (
                    <option key={code} value={code}>
                      {details.nativeName} ({details.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency setting */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                  <div className="flex items-center">
                    <DollarSign size={16} className="mr-2" />
                    {t("settings.currency")}
                  </div>
                </label>
                <div className="flex">
                  <select
                    value={localeSettings.currency}
                    onChange={(e) => handleLocaleChange("currency", e.target.value)}
                    className="w-full p-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] rounded-md rounded-r-none focus:ring-2 focus:ring-[rgb(var(--color-primary-500))] focus:border-[rgb(var(--color-primary-500))] text-[rgb(var(--text-primary))]"
                  >
                    {Object.entries(availableCurrencies).map(([code, details]) => (
                      <option key={code} value={code}>
                        {code} - {details.name} ({details.symbol})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={fetchExchangeRates}
                    title="Refresh exchange rates"
                    className="px-3 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] border-l-0 rounded-r-md hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-primary))]"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Company Details Section */}
          <div className="bg-[rgb(var(--bg-tertiary))] rounded-lg shadow-sm border border-[rgb(var(--border-light))] p-6">
            <h2 className="text-xl font-semibold mb-4 text-[rgb(var(--text-primary))]">
              Company Details
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-1"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="name"
                  value={companySettings.name}
                  onChange={handleCompanyChange}
                  className="w-full px-3 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] rounded-md text-[rgb(var(--text-primary))]"
                />
              </div>

              <div>
                <label
                  htmlFor="tagline"
                  className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-1"
                >
                  Tagline
                </label>
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  value={companySettings.tagline}
                  onChange={handleCompanyChange}
                  className="w-full px-3 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] rounded-md text-[rgb(var(--text-primary))]"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={companySettings.description}
                  onChange={handleCompanyChange}
                  className="w-full px-3 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] rounded-md text-[rgb(var(--text-primary))]"
                  rows={3}
                />
              </div>

              <div>
                <label
                  htmlFor="contactEmail"
                  className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-1"
                >
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={companySettings.contactEmail}
                  onChange={handleCompanyChange}
                  className="w-full px-3 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] rounded-md text-[rgb(var(--text-primary))]"
                />
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-1"
                >
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={companySettings.website}
                  onChange={handleCompanyChange}
                  className="w-full px-3 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] rounded-md text-[rgb(var(--text-primary))]"
                />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[rgb(var(--border-light))]">
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                These settings affect how your company information appears throughout the
                application.
              </p>
            </div>
          </div>

          {/* Feature Flags Section */}
          <div className="bg-[rgb(var(--bg-tertiary))] rounded-lg shadow-sm border border-[rgb(var(--border-light))] p-6">
            <h2 className="text-xl font-semibold mb-4 text-[rgb(var(--text-primary))]">
              Feature Flags
            </h2>
            <div className="space-y-4">
              {Object.entries(featureFlags).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center justify-between">
                  <div className="max-w-[80%]">
                    <span className="text-[rgb(var(--text-primary))] font-medium">
                      {feature
                        .replace("enable", "")
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                    </span>
                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
                      {getFeatureDescription(feature as keyof FeatureFlags)}
                    </p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={enabled}
                      onChange={() => handleFeatureToggle(feature as keyof FeatureFlags)}
                    />
                    <div className="relative w-11 h-6 bg-[rgb(var(--bg-secondary))] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[rgb(var(--color-primary-300))] peer-focus:ring-offset-2 peer-focus:ring-offset-[rgb(var(--bg-tertiary))] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[rgb(var(--border-light))] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--color-primary-600))] shadow-sm"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[rgb(var(--border-light))]">
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                Feature flags control which features are available in the application. Changes to
                feature flags may require refreshing the page to take effect.
              </p>
            </div>
          </div>

          {/* Color Themes Section */}
          <div className="bg-[rgb(var(--bg-tertiary))] rounded-lg shadow-sm border border-[rgb(var(--border-light))] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                <div className="flex items-center">
                  <Palette size={20} className="mr-2 text-[rgb(var(--color-primary-500))]" />
                  Color Customization
                </div>
              </h2>
              <Button variant="outline" size="sm" onClick={handleResetColors} className="text-xs">
                <RotateCcw size={14} className="mr-1" />
                Reset to Defaults
              </Button>
            </div>

            <Text variant="body2" style={{ color: "var(--color-text-secondary)" }}>
              Customize the app&apos;s appearance and behavior to match your preferences.
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Primary Color */}
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Primary Color
                    <div
                      className="w-5 h-5 rounded-full border border-[rgb(var(--border-light))]"
                      style={{ backgroundColor: colorSettings.primary }}
                    ></div>
                  </label>
                  <div className="flex">
                    <input
                      type="color"
                      value={colorSettings.primary}
                      onChange={(e) => handleColorChange("primary", e.target.value)}
                      className="w-full h-10 cursor-pointer rounded-l-md border border-[rgb(var(--border-light))]"
                    />
                    <input
                      type="text"
                      value={colorSettings.primary}
                      onChange={(e) => handleColorChange("primary", e.target.value)}
                      className="w-24 px-2 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] border-l-0 rounded-r-md text-[rgb(var(--text-primary))]"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Secondary Color
                    <div
                      className="w-5 h-5 rounded-full border border-[rgb(var(--border-light))]"
                      style={{ backgroundColor: colorSettings.secondary }}
                    ></div>
                  </label>
                  <div className="flex">
                    <input
                      type="color"
                      value={colorSettings.secondary}
                      onChange={(e) => handleColorChange("secondary", e.target.value)}
                      className="w-full h-10 cursor-pointer rounded-l-md border border-[rgb(var(--border-light))]"
                    />
                    <input
                      type="text"
                      value={colorSettings.secondary}
                      onChange={(e) => handleColorChange("secondary", e.target.value)}
                      className="w-24 px-2 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] border-l-0 rounded-r-md text-[rgb(var(--text-primary))]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Success Color */}
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Success Color
                    <div
                      className="w-5 h-5 rounded-full border border-[rgb(var(--border-light))]"
                      style={{ backgroundColor: colorSettings.success }}
                    ></div>
                  </label>
                  <div className="flex">
                    <input
                      type="color"
                      value={colorSettings.success}
                      onChange={(e) => handleColorChange("success", e.target.value)}
                      className="w-full h-10 cursor-pointer rounded-l-md border border-[rgb(var(--border-light))]"
                    />
                    <input
                      type="text"
                      value={colorSettings.success}
                      onChange={(e) => handleColorChange("success", e.target.value)}
                      className="w-24 px-2 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] border-l-0 rounded-r-md text-[rgb(var(--text-primary))]"
                    />
                  </div>
                </div>

                {/* Warning Color */}
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Warning Color
                    <div
                      className="w-5 h-5 rounded-full border border-[rgb(var(--border-light))]"
                      style={{ backgroundColor: colorSettings.warning }}
                    ></div>
                  </label>
                  <div className="flex">
                    <input
                      type="color"
                      value={colorSettings.warning}
                      onChange={(e) => handleColorChange("warning", e.target.value)}
                      className="w-full h-10 cursor-pointer rounded-l-md border border-[rgb(var(--border-light))]"
                    />
                    <input
                      type="text"
                      value={colorSettings.warning}
                      onChange={(e) => handleColorChange("warning", e.target.value)}
                      className="w-24 px-2 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] border-l-0 rounded-r-md text-[rgb(var(--text-primary))]"
                    />
                  </div>
                </div>

                {/* Error Color */}
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Error Color
                    <div
                      className="w-5 h-5 rounded-full border border-[rgb(var(--border-light))]"
                      style={{ backgroundColor: colorSettings.error }}
                    ></div>
                  </label>
                  <div className="flex">
                    <input
                      type="color"
                      value={colorSettings.error}
                      onChange={(e) => handleColorChange("error", e.target.value)}
                      className="w-full h-10 cursor-pointer rounded-l-md border border-[rgb(var(--border-light))]"
                    />
                    <input
                      type="text"
                      value={colorSettings.error}
                      onChange={(e) => handleColorChange("error", e.target.value)}
                      className="w-24 px-2 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-light))] border-l-0 rounded-r-md text-[rgb(var(--text-primary))]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[rgb(var(--border-light))]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Preview your theme colors before saving. The color changes will be applied to the
                  entire application.
                </p>
                <Button variant="outline" size="sm" onClick={applyColorChanges}>
                  Preview Changes
                </Button>
              </div>
            </div>
          </div>

          {/* Configuration Information */}
          <div className="bg-[rgb(var(--bg-tertiary))] rounded-lg shadow-sm border border-[rgb(var(--border-light))] p-6">
            <h2 className="text-xl font-semibold mb-4 text-[rgb(var(--text-primary))]">
              Configuration Information
            </h2>
            <div className="space-y-4">
              <p className="text-[rgb(var(--text-primary))]">
                Settings are stored in your browser&apos;s localStorage and will persist across page
                reloads and browser sessions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[rgb(var(--bg-secondary))] p-4 rounded border border-[rgb(var(--border-light))]">
                  <h3 className="font-medium text-[rgb(var(--text-primary))] mb-2">Data Storage</h3>
                  <div className="text-sm text-[rgb(var(--text-secondary))]">
                    <p>
                      <span className="font-medium">Storage Key:</span>{" "}
                      finance_analyzer_user_settings
                    </p>
                    <p>
                      <span className="font-medium">Storage Type:</span> localStorage
                    </p>
                    <p>
                      <span className="font-medium">Persistence:</span> Until manually cleared or
                      reset
                    </p>
                  </div>
                </div>

                <div className="bg-[rgb(var(--bg-secondary))] p-4 rounded border border-[rgb(var(--border-light))]">
                  <h3 className="font-medium text-[rgb(var(--text-primary))] mb-2">Theme</h3>
                  <div className="text-sm text-[rgb(var(--text-secondary))]">
                    <p>Light/dark theme toggle is available in the header bar for quick access.</p>
                    <p className="mt-2">Theme preference is saved automatically when toggled.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={testConfiguration}>
            <RefreshCw size={16} className="mr-2" />
            Test Configuration
          </Button>
          <Button variant="primary" onClick={saveSettings}>
            <Save size={16} className="mr-2 text-white" />
            Save Settings
          </Button>
        </div>

        <Text variant="body2" style={{ color: "var(--color-text-secondary)" }}>
          Don&apos;t forget to save your changes before leaving this page.
        </Text>
      </div>
    </Container>
  );
};

// Helper function to get descriptions for feature flags
const getFeatureDescription = (feature: keyof FeatureFlags): string => {
  const descriptions: FeatureDescriptions = {
    enableDataExport: "Allows exporting data in various formats",
    enableDataImport: "Enables importing data from external sources",
    enableCharting: "Provides data visualization through charts and graphs",
    enableReporting: "Allows generating and viewing reports",
    enableNotifications: "Shows notifications for important events",
    enableOfflineMode: "Allows using the app without an internet connection",
    enableSubscriptions: "Enables subscription features and notifications",
  };

  return descriptions[feature] || "Controls this feature's availability";
};

export default Settings;
