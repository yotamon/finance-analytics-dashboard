/**
 * Configuration type definitions for the Finance Analyzer application
 */

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  /**
   * Application name
   */
  appName: string;

  /**
   * API base URL for any external services
   */
  apiBaseUrl?: string;

  /**
   * API key for any external services
   */
  apiKey?: string;

  /**
   * Environment name: development, testing, production
   */
  environment: "development" | "testing" | "production";

  /**
   * Debug mode enabled
   */
  debug: boolean;

  /**
   * Version number
   */
  version: string;

  /**
   * Build timestamp
   */
  buildTime?: string;

  /**
   * Feature flags for conditionally enabling features
   */
  featureFlags: {
    [key: string]: boolean;
  };
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  /**
   * Default chart height
   */
  defaultHeight: number;

  /**
   * Default chart colors
   */
  colors: {
    positive: string;
    negative: string;
    neutral: string;
    sequence: string[];
  };

  /**
   * Animation duration in milliseconds
   */
  animationDuration: number;

  /**
   * Whether to enable tooltips
   */
  tooltips: boolean;

  /**
   * Default date format for time series
   */
  dateFormat: string;

  /**
   * Number format options
   */
  numberFormat: {
    locale: string;
    minimumFractionDigits: number;
    maximumFractionDigits: number;
  };
}

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  /**
   * Grid configuration
   */
  grid: {
    columns: number;
    rowHeight: number;
    margin: [number, number];
    containerPadding: [number, number];
  };

  /**
   * Default widgets to display
   */
  defaultWidgets: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  }[];

  /**
   * Auto refresh interval in seconds (0 = disabled)
   */
  refreshInterval: number;

  /**
   * Available time ranges for filtering
   */
  timeRanges: {
    id: string;
    label: string;
    days: number;
  }[];
}

/**
 * File upload configuration
 */
export interface FileUploadConfig {
  /**
   * Maximum file size in bytes
   */
  maxSize: number;

  /**
   * Allowed file types
   */
  allowedTypes: string[];

  /**
   * Chunk size for large files (in bytes)
   */
  chunkSize: number;

  /**
   * Multiple files allowed
   */
  multiple: boolean;

  /**
   * Default CSV parsing options
   */
  csvOptions: {
    delimiter: string;
    header: boolean;
    skipEmptyLines: boolean;
    dynamicTyping: boolean;
  };

  /**
   * Default Excel parsing options
   */
  excelOptions: {
    sheetIndex: number;
    header: boolean;
    raw: boolean;
  };
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  env: EnvironmentConfig;
  chart: ChartConfig;
  dashboard: DashboardConfig;
  fileUpload: FileUploadConfig;

  /**
   * Default locale
   */
  defaultLocale: string;

  /**
   * Supported locales
   */
  supportedLocales: string[];

  /**
   * Theme configuration
   */
  theme: {
    defaultTheme: "light" | "dark" | "system";
    primaryColor: string;
    secondaryColor: string;
  };

  /**
   * Storage keys for local storage/session storage
   */
  storageKeys: {
    [key: string]: string;
  };
}
