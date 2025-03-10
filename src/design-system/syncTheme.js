/**
 * Theme Synchronization Utility
 *
 * This utility helps synchronize the design system theme with the
 * application's UiContext. This ensures that both systems are always in sync.
 */

import { useEffect } from "react";
import { useTheme } from "./ThemeProvider";

/**
 * Hook to synchronize the design system theme with the UiContext theme
 *
 * @param {object} uiContext - The UiContext containing darkMode and toggleDarkMode
 */
export function useSyncTheme(uiContext) {
	const { darkMode, toggleDarkMode } = uiContext;
	const { theme, setTheme, themeVars } = useTheme();

	// Sync UiContext darkMode to design system theme
	useEffect(() => {
		const designSystemIsDark = theme === "dark";

		// If the themes are out of sync, update design system theme
		if ((darkMode && !designSystemIsDark) || (!darkMode && designSystemIsDark)) {
			setTheme(darkMode ? "dark" : "light");
		}
	}, [darkMode, theme, setTheme]);

	// Apply theme variables to document root when theme changes
	useEffect(() => {
		// Apply CSS variables to root element
		const root = document.documentElement;
		Object.entries(themeVars).forEach(([property, value]) => {
			root.style.setProperty(property, value);
		});
	}, [themeVars]);

	// Create a combined toggle function that updates both systems
	const toggleCombinedTheme = () => {
		// Toggle UiContext theme
		toggleDarkMode();

		// The design system theme will be updated via the effect above
		// This approach allows the UiContext to remain the source of truth
	};

	return {
		isDark: darkMode,
		toggleTheme: toggleCombinedTheme
	};
}

/**
 * Component that synchronizes the design system theme with the UiContext
 *
 * @param {object} props - Component props
 * @param {object} props.uiContext - The UiContext containing darkMode and toggleDarkMode
 * @param {React.ReactNode} props.children - Child components
 */
export function ThemeSynchronizer({ uiContext, children }) {
	useSyncTheme(uiContext);
	return children;
}

export default useSyncTheme;
