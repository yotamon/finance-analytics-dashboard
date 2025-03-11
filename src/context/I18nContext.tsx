/**
 * I18n (Internationalization) Context
 *
 * Provides translation functionality throughout the application.
 * Supports multiple languages and dynamic language switching.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useConfig } from "./ConfigContext";

// Import locale files
import enMessages from "../locales/en.json";
import esMessages from "../locales/es.json";
import frMessages from "../locales/fr.json";
import deMessages from "../locales/de.json";

// Define default locale
const DEFAULT_LOCALE = "en";

// Types
type TranslationKey = string;

interface I18nContextValue {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  availableLanguages: string[];
}

interface I18nProviderProps {
  children: ReactNode;
}

// Create the context
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

// Available locale messages
const localeMessages: Record<string, any> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  de: deMessages,
};

// Hook to use the I18n context
export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

// Provider component
export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<string>(DEFAULT_LOCALE);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([DEFAULT_LOCALE]);
  const [messages, setMessages] = useState<Record<string, any>>({ translations: {} });

  // Initialize from localStorage if available
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage && localeMessages[savedLanguage]) {
      setLanguage(savedLanguage);
    }

    // Set available languages based on loaded locale files
    setAvailableLanguages(Object.keys(localeMessages));
  }, []);

  // Update messages when language changes
  useEffect(() => {
    if (localeMessages[language]) {
      setMessages(localeMessages[language]);
      localStorage.setItem("preferredLanguage", language);
    } else {
      // Fallback to English
      setMessages(localeMessages[DEFAULT_LOCALE]);
    }
  }, [language]);

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, any>): string => {
      if (!key) return "";

      // Get translations object
      const translations = messages.translations || {};

      // First, try direct lookup
      if (translations[key]) {
        const result = translations[key];
        if (typeof result === "string") {
          // Replace parameters if any
          if (params) {
            return Object.entries(params).reduce(
              (acc, [paramKey, paramValue]) => acc.replace(`{${paramKey}}`, String(paramValue)),
              result
            );
          }
          return result;
        }
      }

      // Try with lowercase key
      const lowerKey = key.toLowerCase();
      if (translations[lowerKey]) {
        const lowerResult = translations[lowerKey];
        if (typeof lowerResult === "string") {
          // Replace parameters if any
          if (params) {
            return Object.entries(params).reduce(
              (acc, [paramKey, paramValue]) => acc.replace(`{${paramKey}}`, String(paramValue)),
              lowerResult
            );
          }
          return lowerResult;
        }
      }

      // Try dot notation lookup
      const keyParts = key.split(".");
      let dotResult: any = translations;

      // Navigate through the messages object
      for (const part of keyParts) {
        if (dotResult && typeof dotResult === "object" && part in dotResult) {
          dotResult = dotResult[part];
        } else {
          // If not found in current language, try fallback to English
          if (language !== DEFAULT_LOCALE) {
            const fallbackTranslations = localeMessages[DEFAULT_LOCALE].translations || {};
            let fallbackDotResult = fallbackTranslations;
            let foundInFallback = true;

            // Try to find the key in the fallback language using dot notation
            for (const fallbackPart of keyParts) {
              if (
                fallbackDotResult &&
                typeof fallbackDotResult === "object" &&
                fallbackPart in fallbackDotResult
              ) {
                fallbackDotResult = fallbackDotResult[fallbackPart];
              } else {
                foundInFallback = false;
                break;
              }
            }

            // If found in fallback, use it
            if (foundInFallback && typeof fallbackDotResult === "string") {
              // Replace parameters if any
              if (params) {
                return Object.entries(params).reduce(
                  (acc, [paramKey, paramValue]) => acc.replace(`{${paramKey}}`, String(paramValue)),
                  fallbackDotResult
                );
              }
              return fallbackDotResult;
            }

            // Try direct lookup in fallback
            if (fallbackTranslations[key]) {
              const fallbackDirectResult = fallbackTranslations[key];
              if (typeof fallbackDirectResult === "string") {
                // Replace parameters if any
                if (params) {
                  return Object.entries(params).reduce(
                    (acc, [paramKey, paramValue]) =>
                      acc.replace(`{${paramKey}}`, String(paramValue)),
                    fallbackDirectResult
                  );
                }
                return fallbackDirectResult;
              }
            }
          }

          // If still not found, return the key itself
          if (!dotResult || typeof dotResult !== "string") {
            // eslint-disable-next-line no-console
            console.warn(`Translation key not found or not a string: ${key}`);
            return key;
          }
        }
      }

      if (typeof dotResult === "string") {
        // Replace parameters if any for dot notation result
        if (params) {
          return Object.entries(params).reduce(
            (acc, [paramKey, paramValue]) => acc.replace(`{${paramKey}}`, String(paramValue)),
            dotResult
          );
        }
        return dotResult;
      }

      // If we got here, we couldn't find a valid translation
      if (!dotResult || typeof dotResult !== "string") {
        // eslint-disable-next-line no-console
        console.warn(`Translation key not found or not a string: ${key}`);
        return key;
      }
    },
    [messages, language]
  );

  // Context value
  const contextValue = {
    language,
    setLanguage,
    t,
    availableLanguages,
  };

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}
