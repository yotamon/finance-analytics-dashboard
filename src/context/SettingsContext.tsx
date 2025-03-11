/**
 * SettingsContext - Application settings and user preferences
 *
 * This context handles global application settings and user preferences.
 * It consolidates functionality from ConfigContext and parts of UiContext.
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from "react";

// Types
interface SettingsState {
  // General preferences
  darkMode: boolean;
  compactMode: boolean;

  // Dashboard settings
  dashboardRefreshRate: number; // in minutes, 0 = no auto refresh
  defaultDateRange: string;

  // Chart preferences
  defaultChartType: "bar" | "line" | "pie" | "area";
  chartAnimations: boolean;

  // Currency settings
  defaultCurrency: string;
  showCurrencySymbol: boolean;

  // Export settings
  exportFormat: "pdf" | "png" | "csv" | "xlsx";
  exportQuality: "low" | "medium" | "high";

  // Feature flags
  enableExperimental: boolean;
  enableBetaFeatures: boolean;

  // File processing
  maxFileSize: number; // in MB
}

type SettingsAction =
  | { type: "SET_THEME"; payload: boolean }
  | { type: "SET_COMPACT_MODE"; payload: boolean }
  | { type: "SET_DASHBOARD_REFRESH"; payload: number }
  | { type: "SET_DEFAULT_DATE_RANGE"; payload: string }
  | { type: "SET_DEFAULT_CHART_TYPE"; payload: "bar" | "line" | "pie" | "area" }
  | { type: "SET_CHART_ANIMATIONS"; payload: boolean }
  | { type: "SET_DEFAULT_CURRENCY"; payload: string }
  | { type: "SET_SHOW_CURRENCY_SYMBOL"; payload: boolean }
  | { type: "SET_EXPORT_FORMAT"; payload: "pdf" | "png" | "csv" | "xlsx" }
  | { type: "SET_EXPORT_QUALITY"; payload: "low" | "medium" | "high" }
  | { type: "TOGGLE_EXPERIMENTAL"; payload?: boolean }
  | { type: "TOGGLE_BETA_FEATURES"; payload?: boolean }
  | { type: "SET_MAX_FILE_SIZE"; payload: number }
  | { type: "RESET_TO_DEFAULTS" };

interface SettingsContextType extends SettingsState {
  updateTheme: (isDark: boolean) => void;
  toggleTheme: () => void;
  setCompactMode: (isCompact: boolean) => void;
  setDashboardRefresh: (minutes: number) => void;
  setDefaultDateRange: (range: string) => void;
  setDefaultChartType: (type: "bar" | "line" | "pie" | "area") => void;
  setChartAnimations: (enabled: boolean) => void;
  setDefaultCurrency: (currency: string) => void;
  setCurrencySymbol: (show: boolean) => void;
  setExportFormat: (format: "pdf" | "png" | "csv" | "xlsx") => void;
  setExportQuality: (quality: "low" | "medium" | "high") => void;
  toggleExperimental: (enabled?: boolean) => void;
  toggleBetaFeatures: (enabled?: boolean) => void;
  setMaxFileSize: (size: number) => void;
  resetToDefaults: () => void;
}

// Default settings
const defaultSettings: SettingsState = {
  darkMode: false,
  compactMode: false,
  dashboardRefreshRate: 0,
  defaultDateRange: "30d",
  defaultChartType: "bar",
  chartAnimations: true,
  defaultCurrency: "USD",
  showCurrencySymbol: true,
  exportFormat: "pdf",
  exportQuality: "medium",
  enableExperimental: false,
  enableBetaFeatures: false,
  maxFileSize: 10,
};

// Local storage key
const STORAGE_KEY = "finance-analyzer-settings";

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Reducer function
const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, darkMode: action.payload };
    case "SET_COMPACT_MODE":
      return { ...state, compactMode: action.payload };
    case "SET_DASHBOARD_REFRESH":
      return { ...state, dashboardRefreshRate: action.payload };
    case "SET_DEFAULT_DATE_RANGE":
      return { ...state, defaultDateRange: action.payload };
    case "SET_DEFAULT_CHART_TYPE":
      return { ...state, defaultChartType: action.payload };
    case "SET_CHART_ANIMATIONS":
      return { ...state, chartAnimations: action.payload };
    case "SET_DEFAULT_CURRENCY":
      return { ...state, defaultCurrency: action.payload };
    case "SET_SHOW_CURRENCY_SYMBOL":
      return { ...state, showCurrencySymbol: action.payload };
    case "SET_EXPORT_FORMAT":
      return { ...state, exportFormat: action.payload };
    case "SET_EXPORT_QUALITY":
      return { ...state, exportQuality: action.payload };
    case "TOGGLE_EXPERIMENTAL":
      return {
        ...state,
        enableExperimental:
          action.payload !== undefined ? action.payload : !state.enableExperimental,
      };
    case "TOGGLE_BETA_FEATURES":
      return {
        ...state,
        enableBetaFeatures:
          action.payload !== undefined ? action.payload : !state.enableBetaFeatures,
      };
    case "SET_MAX_FILE_SIZE":
      return { ...state, maxFileSize: action.payload };
    case "RESET_TO_DEFAULTS":
      return { ...defaultSettings };
    default:
      return state;
  }
};

// Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load settings from localStorage
  const loadInitialState = (): SettingsState => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
      return defaultSettings;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load settings from localStorage:", error);
      return defaultSettings;
    }
  };

  const [state, dispatch] = useReducer(settingsReducer, loadInitialState());

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [state]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<SettingsContextType>(
    () => ({
      ...state,
      updateTheme: (isDark: boolean) => dispatch({ type: "SET_THEME", payload: isDark }),
      toggleTheme: () => dispatch({ type: "SET_THEME", payload: !state.darkMode }),
      setCompactMode: (isCompact: boolean) =>
        dispatch({ type: "SET_COMPACT_MODE", payload: isCompact }),
      setDashboardRefresh: (minutes: number) =>
        dispatch({ type: "SET_DASHBOARD_REFRESH", payload: minutes }),
      setDefaultDateRange: (range: string) =>
        dispatch({ type: "SET_DEFAULT_DATE_RANGE", payload: range }),
      setDefaultChartType: (type) => dispatch({ type: "SET_DEFAULT_CHART_TYPE", payload: type }),
      setChartAnimations: (enabled: boolean) =>
        dispatch({ type: "SET_CHART_ANIMATIONS", payload: enabled }),
      setDefaultCurrency: (currency: string) =>
        dispatch({ type: "SET_DEFAULT_CURRENCY", payload: currency }),
      setCurrencySymbol: (show: boolean) =>
        dispatch({ type: "SET_SHOW_CURRENCY_SYMBOL", payload: show }),
      setExportFormat: (format) => dispatch({ type: "SET_EXPORT_FORMAT", payload: format }),
      setExportQuality: (quality) => dispatch({ type: "SET_EXPORT_QUALITY", payload: quality }),
      toggleExperimental: (enabled) => dispatch({ type: "TOGGLE_EXPERIMENTAL", payload: enabled }),
      toggleBetaFeatures: (enabled) => dispatch({ type: "TOGGLE_BETA_FEATURES", payload: enabled }),
      setMaxFileSize: (size: number) => dispatch({ type: "SET_MAX_FILE_SIZE", payload: size }),
      resetToDefaults: () => dispatch({ type: "RESET_TO_DEFAULTS" }),
    }),
    [state]
  );

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};

// Custom hook to use the settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
};

export default SettingsContext;
