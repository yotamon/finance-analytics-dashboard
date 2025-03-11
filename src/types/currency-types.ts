/**
 * Currency and money-related type definitions
 */

/**
 * ISO currency codes
 */
export type CurrencyCode =
  | "USD" // United States Dollar
  | "EUR" // Euro
  | "GBP" // British Pound
  | "JPY" // Japanese Yen
  | "CAD" // Canadian Dollar
  | "AUD" // Australian Dollar
  | "CNY" // Chinese Yuan
  | "INR" // Indian Rupee
  | "CHF" // Swiss Franc
  | "HKD" // Hong Kong Dollar
  | "SGD" // Singapore Dollar
  | "MXN" // Mexican Peso
  | "BRL" // Brazilian Real
  | string; // Allow for custom currencies

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  /**
   * Currency code to use for formatting
   */
  code: CurrencyCode;

  /**
   * Number of decimal places to display
   */
  decimals?: number;

  /**
   * Whether to use grouping separators (e.g., thousands separators)
   */
  useGrouping?: boolean;

  /**
   * Display symbol instead of code (e.g., $ instead of USD)
   */
  useSymbol?: boolean;

  /**
   * Locale to use for formatting (e.g., 'en-US', 'de-DE')
   */
  locale?: string;
}

/**
 * Currency conversion rate
 */
export interface CurrencyRate {
  /**
   * Source currency code
   */
  from: CurrencyCode;

  /**
   * Target currency code
   */
  to: CurrencyCode;

  /**
   * Conversion rate value
   */
  rate: number;

  /**
   * When the rate was last updated
   */
  lastUpdated: Date | string;
}

/**
 * Money value with currency
 */
export interface MoneyValue {
  /**
   * Numeric amount
   */
  amount: number;

  /**
   * Currency code
   */
  currency: CurrencyCode;
}

/**
 * Currency conversion service interface
 */
export interface CurrencyConversion {
  /**
   * Convert amount between currencies
   */
  convert: (amount: number, from: CurrencyCode, to: CurrencyCode) => number;

  /**
   * Get the current rate between currencies
   */
  getRate: (from: CurrencyCode, to: CurrencyCode) => number;

  /**
   * Update rates from external source
   */
  updateRates: () => Promise<void>;

  /**
   * Check if a rate is available
   */
  hasRate: (from: CurrencyCode, to: CurrencyCode) => boolean;
}
