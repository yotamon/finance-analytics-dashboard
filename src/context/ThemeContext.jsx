import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useConfig } from "./ConfigContext";
import { colorPalettes } from "../design-system/tokens";

// Create theme context with the same structure as the design system's ThemeContext
const ThemeContext = createContext();

// Convert hex color to RGB values
const hexToRgb = hex => {
	// Remove the hash if it exists
	hex = hex.replace(/^#/, "");

	// Parse the hex values
	let r, g, b;
	if (hex.length === 3) {
		// For 3-digit hex colors
		r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
		g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
		b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
	} else {
		// For 6-digit hex colors
		r = parseInt(hex.substring(0, 2), 16);
		g = parseInt(hex.substring(2, 4), 16);
		b = parseInt(hex.substring(4, 6), 16);
	}

	return { r, g, b };
};

// Generate color shades (lighter and darker variants)
const generateColorShades = baseColor => {
	// Convert hex to RGB
	const { r, g, b } = hexToRgb(baseColor);

	// Create color palette with different intensities
	const palette = {
		50: adjustColorBrightness(r, g, b, 0.9), // Very light
		100: adjustColorBrightness(r, g, b, 0.8),
		200: adjustColorBrightness(r, g, b, 0.6),
		300: adjustColorBrightness(r, g, b, 0.4),
		400: adjustColorBrightness(r, g, b, 0.2),
		500: `${r}, ${g}, ${b}`, // Base color
		600: adjustColorBrightness(r, g, b, -0.1),
		700: adjustColorBrightness(r, g, b, -0.2),
		800: adjustColorBrightness(r, g, b, -0.3),
		900: adjustColorBrightness(r, g, b, -0.4),
		950: adjustColorBrightness(r, g, b, -0.5) // Very dark
	};

	return palette;
};

// Adjust brightness of RGB color
const adjustColorBrightness = (r, g, b, factor) => {
	// Calculate adjusted RGB values
	const adjustValue = value => {
		let adjusted = factor < 0 ? Math.max(0, Math.floor(value * (1 + factor))) : Math.min(255, Math.floor(value + (255 - value) * factor));
		return adjusted;
	};

	const adjustedR = adjustValue(r);
	const adjustedG = adjustValue(g);
	const adjustedB = adjustValue(b);

	return `${adjustedR}, ${adjustedG}, ${adjustedB}`;
};

// Generate theme variables object that matches design system format
const generateThemeVars = (colors, isDark) => {
	// Generate palettes for each color
	const primaryPalette = generateColorShades(colors.primary);
	const secondaryPalette = generateColorShades(colors.secondary);
	const successPalette = generateColorShades(colors.success);
	const warningPalette = generateColorShades(colors.warning);
	const errorPalette = generateColorShades(colors.error);

	// Override design system's color palettes
	const updatedColorPalettes = {
		primary: {
			50: primaryPalette[50],
			100: primaryPalette[100],
			200: primaryPalette[200],
			300: primaryPalette[300],
			400: primaryPalette[400],
			500: primaryPalette[500],
			600: primaryPalette[600],
			700: primaryPalette[700],
			800: primaryPalette[800],
			900: primaryPalette[900],
			950: primaryPalette[950]
		},
		success: {
			50: successPalette[50],
			100: successPalette[100],
			500: successPalette[500],
			600: successPalette[600]
		},
		warning: {
			50: warningPalette[50],
			100: warningPalette[100],
			500: warningPalette[500],
			600: warningPalette[600]
		},
		error: {
			50: errorPalette[50],
			100: errorPalette[100],
			500: errorPalette[500],
			600: errorPalette[600]
		}
	};

	// Create theme-specific variables (like the design system)
	const themeVars = {
		// Primary colors
		"--color-primary-50": updatedColorPalettes.primary[50],
		"--color-primary-100": updatedColorPalettes.primary[100],
		"--color-primary-200": updatedColorPalettes.primary[200],
		"--color-primary-300": updatedColorPalettes.primary[300],
		"--color-primary-400": updatedColorPalettes.primary[400],
		"--color-primary-500": updatedColorPalettes.primary[500],
		"--color-primary-600": updatedColorPalettes.primary[600],
		"--color-primary-700": updatedColorPalettes.primary[700],
		"--color-primary-800": updatedColorPalettes.primary[800],
		"--color-primary-900": updatedColorPalettes.primary[900],
		"--color-primary-950": updatedColorPalettes.primary[950],

		// Success colors
		"--color-success-50": updatedColorPalettes.success[50],
		"--color-success-100": updatedColorPalettes.success[100],
		"--color-success-500": updatedColorPalettes.success[500],
		"--color-success-600": updatedColorPalettes.success[600],

		// Error colors
		"--color-error-50": updatedColorPalettes.error[50],
		"--color-error-100": updatedColorPalettes.error[100],
		"--color-error-500": updatedColorPalettes.error[500],
		"--color-error-600": updatedColorPalettes.error[600],

		// Warning colors
		"--color-warning-50": updatedColorPalettes.warning[50],
		"--color-warning-100": updatedColorPalettes.warning[100],
		"--color-warning-500": updatedColorPalettes.warning[500],
		"--color-warning-600": updatedColorPalettes.warning[600],

		// Text colors
		"--text-secondary": secondaryPalette[600],
		"--text-tertiary": secondaryPalette[400]
	};

	return themeVars;
};

// Apply CSS variables to document root
const applyColorsToCssVars = themeVars => {
	// Get the root element
	const root = document.documentElement;

	// Apply CSS variables
	Object.entries(themeVars).forEach(([key, value]) => {
		root.style.setProperty(key, value);
	});
};

export function ThemeProvider({ children, defaultTheme = "light" }) {
	const { getConfig, updateConfig } = useConfig();

	// State for current theme (light/dark)
	const [theme, setTheme] = useState(() => {
		// Try to get theme from localStorage
		const savedTheme = typeof window !== "undefined" ? localStorage.getItem("finance-analyzer-theme") : null;
		return savedTheme || getConfig("app.defaultTheme", defaultTheme);
	});

	// State for custom colors
	const [customColors, setCustomColors] = useState({
		primary: getConfig("theme.colors.primary", "#6366f1"),
		secondary: getConfig("theme.colors.secondary", "#6b7280"),
		success: getConfig("theme.colors.success", "#10b981"),
		warning: getConfig("theme.colors.warning", "#f59e0b"),
		error: getConfig("theme.colors.error", "#ef4444")
	});

	// Boolean check for dark mode
	const isDark = theme === "dark";

	// Update custom colors when config changes
	useEffect(() => {
		const configColors = {
			primary: getConfig("theme.colors.primary"),
			secondary: getConfig("theme.colors.secondary"),
			success: getConfig("theme.colors.success"),
			warning: getConfig("theme.colors.warning"),
			error: getConfig("theme.colors.error")
		};

		// Check if any of the config colors exist and are different from current
		const hasConfigColors = Object.values(configColors).some(val => val !== undefined);

		if (hasConfigColors) {
			// Update with the config values (or use defaults where undefined)
			setCustomColors(prev => ({
				primary: configColors.primary || prev.primary,
				secondary: configColors.secondary || prev.secondary,
				success: configColors.success || prev.success,
				warning: configColors.warning || prev.warning,
				error: configColors.error || prev.error
			}));
		}
	}, [getConfig]);

	// Generate theme variables
	const themeVars = useMemo(() => generateThemeVars(customColors, isDark), [customColors, isDark]);

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
		applyColorsToCssVars(themeVars);
	}, [theme, isDark, themeVars]);

	// Set theme mode (light/dark)
	const setThemeMode = mode => {
		if (mode === "light" || mode === "dark") {
			setTheme(mode);
		}
	};

	// Toggle theme function
	const toggleTheme = () => {
		setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
	};

	// Update the theme colors
	const updateThemeColors = colors => {
		// Update the state
		setCustomColors(colors);
	};

	// Reset theme colors to defaults
	const resetThemeColors = () => {
		const defaultColors = {
			primary: "#6366f1",
			secondary: "#6b7280",
			success: "#10b981",
			warning: "#f59e0b",
			error: "#ef4444"
		};

		// Update the state
		setCustomColors(defaultColors);

		// Reset in config
		Object.entries(defaultColors).forEach(([key, value]) => {
			updateConfig(`theme.colors.${key}`, value);
		});
	};

	// Context value - match the design system's ThemeContext interface
	const value = {
		theme,
		isDark,
		toggleTheme,
		setTheme: setThemeMode,
		themeVars,
		currentTheme: customColors,
		updateThemeColors,
		resetThemeColors
	};

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);

	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
}
