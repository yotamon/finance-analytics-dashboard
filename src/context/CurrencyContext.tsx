/**
 * CurrencyContext - Currency formatting and conversion
 *
 * This context provides currency-related functionality including currency
 * selection, value formatting, and conversion between currencies.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { CurrencyCode, CurrencyRate } from "@/types/currency-types";

// Currency configuration with symbols, locales and static exchange rates
interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  rate: number;
  format: (value: number) => string;
}

type CurrencyMap = Record<CurrencyCode, CurrencyConfig>;

// In a production app, these rates would come from an API
const CURRENCIES: CurrencyMap = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
    rate: 1, // Base currency
    format: (value: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value),
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "de-DE",
    rate: 0.93, // 1 USD = 0.93 EUR (example rate)
    format: (value: number) =>
      new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value),
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    locale: "en-GB",
    rate: 0.79, // 1 USD = 0.79 GBP (example rate)
    format: (value: number) =>
      new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value),
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    locale: "ja-JP",
    rate: 153.8, // 1 USD = 153.8 JPY (example rate)
    format: (value: number) =>
      new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(value),
  },
  CNY: {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    locale: "zh-CN",
    rate: 7.23, // 1 USD = 7.23 CNY (example rate)
    format: (value: number) =>
      new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(value),
  },
};

// Context type
interface CurrencyContextType {
  /**
   * Current currency configuration
   */
  currency: CurrencyConfig;

  /**
   * All available currencies
   */
  availableCurrencies: CurrencyMap;

  /**
   * Function to change the active currency
   */
  changeCurrency: (currencyCode: CurrencyCode) => void;

  /**
   * Convert a USD value to current currency
   */
  convert: (valueInUSD: number) => number | null;

  /**
   * Format a USD value to current currency string
   */
  format: (valueInUSD: number) => string;

  /**
   * Fetch latest exchange rates
   */
  fetchExchangeRates: () => Promise<void>;

  /**
   * Loading state when updating rates
   */
  isLoading: boolean;

  /**
   * When rates were last updated
   */
  lastUpdated: Date | null;
}

// Create the context
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Provider props
interface CurrencyProviderProps {
  children: ReactNode;
}

/**
 * Currency provider component
 */
export function CurrencyProvider({ children }: CurrencyProviderProps): JSX.Element {
  const [currency, setCurrency] = useState<CurrencyConfig>(CURRENCIES.USD);
  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, number>>(
    {} as Record<CurrencyCode, number>
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Initialize currency from local storage
  useEffect(() => {
    const savedCurrency = localStorage.getItem("preferredCurrency") as CurrencyCode | null;
    const currencyToUse = savedCurrency || "USD";

    if (CURRENCIES[currencyToUse]) {
      setCurrency(CURRENCIES[currencyToUse]);
    }

    // Set initial static exchange rates
    setExchangeRates(
      Object.keys(CURRENCIES).reduce<Record<CurrencyCode, number>>((acc, code) => {
        acc[code as CurrencyCode] = CURRENCIES[code as CurrencyCode].rate;
        return acc;
      }, {} as Record<CurrencyCode, number>)
    );

    setLastUpdated(new Date());
  }, []);

  // Function to fetch latest exchange rates from an API
  // In a real app, you would implement this using a currency API
  const fetchExchangeRates = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulating API call with our static rates
      // In a real app, replace with actual API call:
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();
      // setExchangeRates(data.rates);

      // For now, we'll just use our static rates with a slight randomization
      const simulatedRates = Object.keys(CURRENCIES).reduce<Record<CurrencyCode, number>>(
        (acc, code) => {
          // Add a small random fluctuation (+/- 0.5%)
          const fluctuation = 1 + (Math.random() * 0.01 - 0.005);
          acc[code as CurrencyCode] = CURRENCIES[code as CurrencyCode].rate * fluctuation;
          return acc;
        },
        {} as Record<CurrencyCode, number>
      );

      setExchangeRates(simulatedRates);
      setLastUpdated(new Date());
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching exchange rates:", error);
      setIsLoading(false);
    }
  };

  // Function to change the currency
  const changeCurrency = (currencyCode: CurrencyCode): void => {
    if (CURRENCIES[currencyCode]) {
      setCurrency(CURRENCIES[currencyCode]);
      localStorage.setItem("preferredCurrency", currencyCode);
    }
  };

  // Function to convert a value from USD to the current currency
  const convert = (valueInUSD: number): number | null => {
    if (valueInUSD === undefined || valueInUSD === null) return null;
    const rate = exchangeRates[currency.code] || currency.rate;
    return valueInUSD * rate;
  };

  // Function to format a value according to the current currency
  const format = (valueInUSD: number): string => {
    if (valueInUSD === undefined || valueInUSD === null) return "";
    const convertedValue = convert(valueInUSD);
    return convertedValue !== null ? currency.format(convertedValue) : "";
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<CurrencyContextType>(
    () => ({
      currency,
      availableCurrencies: CURRENCIES,
      changeCurrency,
      convert,
      format,
      fetchExchangeRates,
      isLoading,
      lastUpdated,
    }),
    [currency, exchangeRates, isLoading, lastUpdated]
  );

  return <CurrencyContext.Provider value={contextValue}>{children}</CurrencyContext.Provider>;
}

/**
 * Hook to use the currency context
 */
export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);

  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  return context;
}

export default CurrencyContext;
