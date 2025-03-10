import { createContext, useContext, useState, useEffect } from "react";
import { useConfig } from "./ConfigContext";
import { getThemeConfig } from "../utils/configUtils";

const UiContext = createContext();

export function UiProvider({ children }) {
	const { getConfig } = useConfig();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [darkMode, setDarkMode] = useState(false);
	const [activeTab, setActiveTab] = useState("overview");
	const [theme, setTheme] = useState(getThemeConfig());

	// Initialize darkMode from config and apply it to document
	useEffect(() => {
		const defaultTheme = getConfig("app.defaultTheme", "light");
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

	const toggleSidebar = () => setSidebarOpen(prev => !prev);

	const toggleDarkMode = () => {
		setDarkMode(prev => {
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
				layout: getConfig("ui.layout", {}),
				// Animation settings from config
				animation: getConfig("ui.animation", {}),
				// Date/time format preferences
				dateFormat: getConfig("ui.dateFormat", "YYYY-MM-DD"),
				timeFormat: getConfig("ui.timeFormat", "HH:mm:ss"),
				// Responsive breakpoints
				responsive: getConfig("ui.responsive", {})
			}}>
			{children}
		</UiContext.Provider>
	);
}

export function useUi() {
	const context = useContext(UiContext);
	if (!context) {
		throw new Error("useUi must be used within a UiProvider");
	}
	return context;
}
