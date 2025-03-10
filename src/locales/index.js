import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import de from "./de.json";

// Export all languages
export const languages = {
	en,
	es,
	fr,
	de
};

// Export default language
export const defaultLanguage = "en";

// Get a language by code
export const getLanguage = code => {
	return languages[code] || languages[defaultLanguage];
};

// Get available languages for the language selector
export const getAvailableLanguages = () => {
	return Object.keys(languages).map(code => ({
		code,
		name: languages[code].name,
		nativeName: languages[code].nativeName
	}));
};
