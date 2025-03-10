import { createContext, useContext, useState, useEffect } from "react";
import { useConfig } from "./ConfigContext";
import { languages, defaultLanguage, getLanguage, getAvailableLanguages } from "../locales";

const I18nContext = createContext();

export function I18nProvider({ children }) {
	const { getConfig } = useConfig();
	const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);
	const [translations, setTranslations] = useState(getLanguage(defaultLanguage).translations);

	// Initialize language from config
	useEffect(() => {
		const configLanguage = getConfig("app.language", defaultLanguage);
		if (languages[configLanguage]) {
			setCurrentLanguage(configLanguage);
			setTranslations(getLanguage(configLanguage).translations);
		}
	}, [getConfig]);

	// Function to change language
	const changeLanguage = languageCode => {
		if (languages[languageCode]) {
			setCurrentLanguage(languageCode);
			setTranslations(getLanguage(languageCode).translations);
			// Save preference to localStorage
			localStorage.setItem("preferredLanguage", languageCode);
		}
	};

	// Translation function
	const t = (key, defaultValue = key) => {
		return translations[key] || defaultValue;
	};

	return (
		<I18nContext.Provider
			value={{
				currentLanguage,
				changeLanguage,
				t,
				availableLanguages: getAvailableLanguages()
			}}>
			{children}
		</I18nContext.Provider>
	);
}

export function useI18n() {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useI18n must be used within an I18nProvider");
	}
	return context;
}
