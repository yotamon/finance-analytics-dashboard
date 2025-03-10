/**
 * Design System
 *
 * Main entry point for the design system.
 * Exports all components, hooks, and utilities.
 */

// Theme provider and hooks
export { default as ThemeProvider, useTheme } from "./ThemeProvider";

// Design tokens
export { default as tokens, colorPalettes, typography, spacing, borderRadius, shadows, transitions, zIndex, breakpoints } from "./tokens";

// Base components
export { default as Box } from "./components/Box";
export { default as Button } from "./components/Button";
export { default as Card } from "./components/Card";
export { CardHeader, CardBody, CardFooter } from "./components/Card";
export { default as Text } from "./components/Text";

// Utility functions
export const hexToRgb = hex => {
	// Remove # if present
	hex = hex.replace("#", "");

	// Parse the hex values
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	// Return RGB format
	return `${r} ${g} ${b}`;
};

export const rgbToHex = (r, g, b) => {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Color manipulation utilities
export const adjustBrightness = (hex, percent) => {
	// Remove # if present
	hex = hex.replace("#", "");

	// Parse the hex values
	let r = parseInt(hex.substring(0, 2), 16);
	let g = parseInt(hex.substring(2, 4), 16);
	let b = parseInt(hex.substring(4, 6), 16);

	// Adjust brightness
	r = Math.min(255, Math.max(0, Math.round(r * (1 + percent / 100))));
	g = Math.min(255, Math.max(0, Math.round(g * (1 + percent / 100))));
	b = Math.min(255, Math.max(0, Math.round(b * (1 + percent / 100))));

	// Convert back to hex
	return rgbToHex(r, g, b);
};

// CSS variable helpers
export const getCssVariable = variableName => {
	if (typeof window !== "undefined") {
		return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
	}
	return "";
};

// Create a function to get a CSS color with fallback
export const getThemeColor = (colorVar, fallback = "") => {
	return `var(${colorVar}, ${fallback})`;
};
