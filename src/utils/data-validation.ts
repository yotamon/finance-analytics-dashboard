/**
 * Data validation utilities to ensure components receive valid data and
 * prevent runtime errors when dealing with potentially undefined or null values.
 */

/**
 * Ensures an array is valid, returning an empty array if the input is null or undefined
 * @param array The array to validate
 * @returns A valid array (either the original or an empty array)
 */
export function ensureArray<T>(array: T[] | null | undefined): T[] {
  return Array.isArray(array) ? array : [];
}

/**
 * Ensures an object is valid, returning an empty object if the input is null or undefined
 * @param obj The object to validate
 * @returns A valid object (either the original or an empty object)
 */
export function ensureObject<T extends object>(obj: T | null | undefined): T {
  return obj && typeof obj === "object" ? obj : ({} as T);
}

/**
 * Safely accesses a nested property in an object without causing errors
 * @param obj The object to access properties from
 * @param path The path to the desired property (e.g., 'user.address.street')
 * @param defaultValue The default value to return if the path doesn't exist
 * @returns The value at the specified path or the default value
 */
export function safelyAccessNestedProperty<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (result === undefined || result === null) {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined && result !== null ? result : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Safely formats a number for display, handling null/undefined values
 * @param value The number to format
 * @param options Intl.NumberFormat options
 * @param fallback Fallback value if the input is invalid
 * @returns Formatted number string
 */
export function safeNumberFormat(
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {},
  fallback: string = "0"
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }

  try {
    return new Intl.NumberFormat(undefined, options).format(value);
  } catch (error) {
    return fallback;
  }
}

/**
 * Safely formats a currency value for display
 * @param value The number to format as currency
 * @param currency The currency code (e.g., 'USD')
 * @param fallback Fallback value if the input is invalid
 * @returns Formatted currency string
 */
export function safeCurrencyFormat(
  value: number | null | undefined,
  currency: string = "USD",
  fallback: string = "$0"
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(value);
  } catch (error) {
    return fallback;
  }
}
