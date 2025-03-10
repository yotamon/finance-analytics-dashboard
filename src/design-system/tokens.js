/**
 * Design System Tokens
 *
 * This file defines all design tokens used throughout the application,
 * serving as a single source of truth for the design system.
 */

// Define semantic color palettes
export const colorPalettes = {
	// Neutral palette
	neutral: {
		50: "#f9fafb",
		100: "#f3f4f6",
		200: "#e5e7eb",
		300: "#d1d5db",
		400: "#9ca3af",
		500: "#6b7280",
		600: "#4b5563",
		700: "#374151",
		800: "#1f2937",
		900: "#111827",
		950: "#030712"
	},

	// Primary palette - Indigo
	primary: {
		50: "#eef2ff",
		100: "#e0e7ff",
		200: "#c7d2fe",
		300: "#a5b4fc",
		400: "#818cf8",
		500: "#6366f1",
		600: "#4f46e5",
		700: "#4338ca",
		800: "#3730a3",
		900: "#312e81",
		950: "#1e1b4b"
	},

	// Success palette - Green
	success: {
		50: "#ecfdf5",
		100: "#d1fae5",
		200: "#a7f3d0",
		300: "#6ee7b7",
		400: "#34d399",
		500: "#10b981",
		600: "#059669",
		700: "#047857",
		800: "#065f46",
		900: "#064e3b",
		950: "#022c22"
	},

	// Warning palette - Amber
	warning: {
		50: "#fffbeb",
		100: "#fef3c7",
		200: "#fde68a",
		300: "#fcd34d",
		400: "#fbbf24",
		500: "#f59e0b",
		600: "#d97706",
		700: "#b45309",
		800: "#92400e",
		900: "#78350f",
		950: "#451a03"
	},

	// Error palette - Red
	error: {
		50: "#fef2f2",
		100: "#fee2e2",
		200: "#fecaca",
		300: "#fca5a5",
		400: "#f87171",
		500: "#ef4444",
		600: "#dc2626",
		700: "#b91c1c",
		800: "#991b1b",
		900: "#7f1d1d",
		950: "#450a0a"
	},

	// Info palette - Blue
	info: {
		50: "#eff6ff",
		100: "#dbeafe",
		200: "#bfdbfe",
		300: "#93c5fd",
		400: "#60a5fa",
		500: "#3b82f6",
		600: "#2563eb",
		700: "#1d4ed8",
		800: "#1e40af",
		900: "#1e3a8a",
		950: "#172554"
	}
};

// Typography
export const typography = {
	fontFamily: {
		base: "'Inter', 'Segoe UI', Roboto, Arial, sans-serif",
		mono: "'Fira Code', 'Courier New', monospace",
		heading: "'Inter', 'Segoe UI', Roboto, Arial, sans-serif"
	},
	fontWeight: {
		light: 300,
		regular: 400,
		medium: 500,
		semibold: 600,
		bold: 700,
		extrabold: 800
	},
	fontSize: {
		xs: "0.75rem", // 12px
		sm: "0.875rem", // 14px
		base: "1rem", // 16px
		lg: "1.125rem", // 18px
		xl: "1.25rem", // 20px
		"2xl": "1.5rem", // 24px
		"3xl": "1.875rem", // 30px
		"4xl": "2.25rem", // 36px
		"5xl": "3rem", // 48px
		"6xl": "3.75rem", // 60px
		"7xl": "4.5rem", // 72px
		"8xl": "6rem", // 96px
		"9xl": "8rem" // 128px
	},
	lineHeight: {
		none: "1",
		tight: "1.25",
		snug: "1.375",
		normal: "1.5",
		relaxed: "1.625",
		loose: "2"
	},
	letterSpacing: {
		tighter: "-0.05em",
		tight: "-0.025em",
		normal: "0em",
		wide: "0.025em",
		wider: "0.05em",
		widest: "0.1em"
	}
};

// Spacing
export const spacing = {
	0: "0px",
	0.5: "0.125rem",
	1: "0.25rem",
	1.5: "0.375rem",
	2: "0.5rem",
	2.5: "0.625rem",
	3: "0.75rem",
	3.5: "0.875rem",
	4: "1rem",
	5: "1.25rem",
	6: "1.5rem",
	7: "1.75rem",
	8: "2rem",
	9: "2.25rem",
	10: "2.5rem",
	11: "2.75rem",
	12: "3rem",
	14: "3.5rem",
	16: "4rem",
	20: "5rem",
	24: "6rem",
	28: "7rem",
	32: "8rem",
	36: "9rem",
	40: "10rem",
	44: "11rem",
	48: "12rem",
	52: "13rem",
	56: "14rem",
	60: "15rem",
	64: "16rem",
	72: "18rem",
	80: "20rem",
	96: "24rem"
};

// Border radius
export const borderRadius = {
	none: "0px",
	sm: "0.125rem",
	DEFAULT: "0.25rem",
	md: "0.375rem",
	lg: "0.5rem",
	xl: "0.75rem",
	"2xl": "1rem",
	"3xl": "1.5rem",
	full: "9999px"
};

// Shadows
export const shadows = {
	none: "none",
	sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
	DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
	md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
	lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
	xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
	"2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
	inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)"
};

// Transitions
export const transitions = {
	duration: {
		fast: "150ms",
		normal: "300ms",
		slow: "500ms",
		slower: "700ms"
	},
	timing: {
		ease: "ease",
		linear: "linear",
		easeIn: "cubic-bezier(0.4, 0, 1, 1)",
		easeOut: "cubic-bezier(0, 0, 0.2, 1)",
		easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)"
	}
};

// Z-index
export const zIndex = {
	0: "0",
	10: "10",
	20: "20",
	30: "30",
	40: "40",
	50: "50",
	auto: "auto",
	dropdown: "1000",
	sticky: "1020",
	fixed: "1030",
	modalBackdrop: "1040",
	modal: "1050",
	popover: "1060",
	tooltip: "1070"
};

// Breakpoints
export const breakpoints = {
	xs: "0px",
	sm: "640px",
	md: "768px",
	lg: "1024px",
	xl: "1280px",
	"2xl": "1536px"
};

// Export all tokens
export const tokens = {
	colorPalettes,
	typography,
	spacing,
	borderRadius,
	shadows,
	transitions,
	zIndex,
	breakpoints
};

export default tokens;
