import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { tokens, colorPalettes } from "./tokens";

/**
 * Theme Context
 *
 * Provides theme state and functions to the component tree
 */
const ThemeContext = createContext(undefined);

/**
 * Function to generate CSS variables for a theme
 */
const generateThemeVars = isDark => {
	// Common variables for both themes
	const baseVars = {
		// Typography
		"--font-family-base": tokens.typography.fontFamily.base,
		"--font-family-heading": tokens.typography.fontFamily.heading,
		"--font-family-mono": tokens.typography.fontFamily.mono,

		// Border radius
		"--border-radius-sm": tokens.borderRadius.sm,
		"--border-radius-md": tokens.borderRadius.md,
		"--border-radius-lg": tokens.borderRadius.lg,
		"--border-radius-xl": tokens.borderRadius.xl,

		// Transitions
		"--transition-fast": tokens.transitions.duration.fast,
		"--transition-normal": tokens.transitions.duration.normal,
		"--transition-slow": tokens.transitions.duration.slow,
		"--transition-timing-ease": tokens.transitions.timing.ease,
		"--transition-timing-ease-in-out": tokens.transitions.timing.easeInOut
	};

	// Theme-specific color variables
	const themeVars = isDark
		? {
				// Dark theme colors
				"--color-bg-primary": "#0f172a", // slate-900
				"--color-bg-secondary": "#1e293b", // slate-800
				"--color-bg-tertiary": "#334155", // slate-700
				"--color-bg-muted": "#475569", // slate-600
				"--color-bg-input": "#1e293b", // slate-800

				"--color-text-primary": "#f8fafc", // slate-50
				"--color-text-secondary": "#e2e8f0", // slate-200
				"--color-text-tertiary": "#94a3b8", // slate-400
				"--color-text-muted": "#64748b", // slate-500

				"--color-border-default": "#334155", // slate-700
				"--color-border-muted": "#1e293b", // slate-800

				"--shadow-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.2)",
				"--shadow-md": "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
				"--shadow-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)"
		}
		: {
				// Light theme colors
				"--color-bg-primary": "#ffffff", // white
				"--color-bg-secondary": "#f8fafc", // slate-50
				"--color-bg-tertiary": "#f1f5f9", // slate-100
				"--color-bg-muted": "#e2e8f0", // slate-200
				"--color-bg-input": "#ffffff", // white

				"--color-text-primary": "#0f172a", // slate-900
				"--color-text-secondary": "#1e293b", // slate-800
				"--color-text-tertiary": "#475569", // slate-600
				"--color-text-muted": "#64748b", // slate-500

				"--color-border-default": "#e2e8f0", // slate-200
				"--color-border-muted": "#f1f5f9", // slate-100

				"--shadow-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
				"--shadow-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
				"--shadow-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
		};

	// Define semantic color variables that remain consistent across themes
	const semanticVars = {
		// Primary colors
		"--color-primary-50": colorPalettes.primary[50],
		"--color-primary-100": colorPalettes.primary[100],
		"--color-primary-200": colorPalettes.primary[200],
		"--color-primary-300": colorPalettes.primary[300],
		"--color-primary-400": colorPalettes.primary[400],
		"--color-primary-500": colorPalettes.primary[500],
		"--color-primary-600": colorPalettes.primary[600],
		"--color-primary-700": colorPalettes.primary[700],
		"--color-primary-800": colorPalettes.primary[800],
		"--color-primary-900": colorPalettes.primary[900],
		"--color-primary-950": colorPalettes.primary[950],

		// Success colors
		"--color-success-50": colorPalettes.success[50],
		"--color-success-100": colorPalettes.success[100],
		"--color-success-500": colorPalettes.success[500],
		"--color-success-600": colorPalettes.success[600],

		// Error colors
		"--color-error-50": colorPalettes.error[50],
		"--color-error-100": colorPalettes.error[100],
		"--color-error-500": colorPalettes.error[500],
		"--color-error-600": colorPalettes.error[600],

		// Warning colors
		"--color-warning-50": colorPalettes.warning[50],
		"--color-warning-100": colorPalettes.warning[100],
		"--color-warning-500": colorPalettes.warning[500],
		"--color-warning-600": colorPalettes.warning[600],

		// Info colors
		"--color-info-50": colorPalettes.info[50],
		"--color-info-100": colorPalettes.info[100],
		"--color-info-500": colorPalettes.info[500],
		"--color-info-600": colorPalettes.info[600]
	};

	// Return merged variables
	return { ...baseVars, ...themeVars, ...semanticVars };
};

/**
 * ThemeProvider Component
 *
 * Provides theme context and applies CSS variables to the document
 */
export const ThemeProvider = ({ children, defaultTheme = "light" }) => {
	// Initialize theme state from localStorage or default
	const [theme, setTheme] = useState(() => {
		// Try to get theme from localStorage
		const savedTheme = typeof window !== "undefined" ? localStorage.getItem("finance-analyzer-theme") : null;
		return savedTheme || defaultTheme;
	});

	// Boolean check for dark mode
	const isDark = theme === "dark";

	// Theme variables
	const themeVars = useMemo(() => generateThemeVars(isDark), [isDark]);

	// Apply theme variables to document root
	useEffect(() => {
		// Save theme choice to localStorage
		localStorage.setItem("finance-analyzer-theme", theme);

		// Apply dark mode class to document
		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}

		// Apply CSS variables
		const root = document.documentElement;
		Object.entries(themeVars).forEach(([property, value]) => {
			root.style.setProperty(property, value);
		});
	}, [theme, isDark, themeVars]);

	// Toggle theme function
	const toggleTheme = () => {
		setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
	};

	// Set theme function
	const setThemeMode = mode => {
		if (mode === "light" || mode === "dark") {
			setTheme(mode);
		}
	};

	// Context value
	const value = {
		theme,
		isDark,
		toggleTheme,
		setTheme: setThemeMode,
		themeVars
	};

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook for accessing the theme
 */
export const useTheme = () => {
	const context = useContext(ThemeContext);

	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
};

export default ThemeProvider;
