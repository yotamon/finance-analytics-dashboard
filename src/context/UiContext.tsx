/**
 * UiContext - UI preferences and theme management
 *
 * Provides UI state and preferences including sidebar state,
 * dark mode, active tab, and other UI configuration options.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useConfig } from "./ConfigContext";
import { getThemeConfig } from "../utils/configUtils";

// Type definitions
interface Layout {
  contentWidth?: string;
  sidebarWidth?: string;
  headerHeight?: string;
  footerHeight?: string;
  [key: string]: any;
}

interface Animation {
  enabled?: boolean;
  duration?: number;
  easing?: string;
  [key: string]: any;
}

interface ResponsiveBreakpoints {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  [key: string]: any;
}

interface UiTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    error: string;
    text: string;
    [key: string]: string;
  };
  spacing: {
    unit: number;
    [key: string]: number;
  };
  [key: string]: any;
}

interface UiContextType {
  /**
   * Whether the sidebar is open
   */
  sidebarOpen: boolean;

  /**
   * Function to toggle sidebar state
   */
  toggleSidebar: () => void;

  /**
   * Whether dark mode is enabled
   */
  darkMode: boolean;

  /**
   * Function to toggle dark mode
   */
  toggleDarkMode: () => void;

  /**
   * Currently active tab
   */
  activeTab: string;

  /**
   * Function to set the active tab
   */
  setActiveTab: (tab: string) => void;

  /**
   * Current theme configuration
   */
  theme: UiTheme;

  /**
   * Layout configuration
   */
  layout: Layout;

  /**
   * Animation settings
   */
  animation: Animation;

  /**
   * Date format preference
   */
  dateFormat: string;

  /**
   * Time format preference
   */
  timeFormat: string;

  /**
   * Responsive breakpoints
   */
  responsive: ResponsiveBreakpoints;
}

interface UiProviderProps {
  children: ReactNode;
}

// Create the context
const UiContext = createContext<UiContextType | undefined>(undefined);

/**
 * UI provider component
 */
export function UiProvider({ children }: UiProviderProps): JSX.Element {
  const { getConfig } = useConfig();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [theme, setTheme] = useState<UiTheme>(getThemeConfig());

  // Initialize darkMode from config and apply it to document
  useEffect(() => {
    const defaultTheme = getConfig<string>("app.defaultTheme", "light");
    const isDark = defaultTheme === "dark";
    setDarkMode(isDark);

    // Apply dark mode class to document
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [getConfig]);

  // Update theme when config changes
  useEffect(() => {
    setTheme(getThemeConfig());
  }, [getConfig]);

  const toggleSidebar = (): void => setSidebarOpen((prev) => !prev);

  const toggleDarkMode = (): void => {
    setDarkMode((prev) => {
      const newDarkMode = !prev;

      // Apply dark mode class to document
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      return newDarkMode;
    });
  };

  return (
    <UiContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        darkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        theme,
        // Layout values from config
        layout: getConfig<Layout>("ui.layout", {}),
        // Animation settings from config
        animation: getConfig<Animation>("ui.animation", {}),
        // Date/time format preferences
        dateFormat: getConfig<string>("ui.dateFormat", "YYYY-MM-DD"),
        timeFormat: getConfig<string>("ui.timeFormat", "HH:mm:ss"),
        // Responsive breakpoints
        responsive: getConfig<ResponsiveBreakpoints>("ui.responsive", {}),
      }}
    >
      {children}
    </UiContext.Provider>
  );
}

/**
 * Hook to use the UI context
 */
export function useUi(): UiContextType {
  const context = useContext(UiContext);

  if (context === undefined) {
    throw new Error("useUi must be used within a UiProvider");
  }

  return context;
}

export default UiContext;
