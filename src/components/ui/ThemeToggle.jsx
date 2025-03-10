import { useState, useEffect } from "react";
import { IconButton, Tooltip, useTheme, alpha } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

/**
 * ThemeToggle - A component for toggling between light and dark themes
 *
 * This component provides a simple interface for users to switch between
 * light and dark modes. It persists the user's preference in localStorage.
 */
function ThemeToggle({ className = "" }) {
	const theme = useTheme();

	// Initialize state from localStorage or system preference
	const [isDark, setIsDark] = useState(() => {
		// Check if there's a theme preference in localStorage
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme) {
			return savedTheme === "dark";
		}
		// If no preference, use system preference
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	});

	// Apply theme changes
	useEffect(() => {
		// Update DOM
		if (isDark) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}, [isDark]);

	// Toggle theme
	const toggleTheme = () => {
		setIsDark(!isDark);
	};

	return (
		<Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
			<IconButton
				onClick={toggleTheme}
				color="inherit"
				className={className}
				sx={{
					backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.1),
					"&:hover": {
						backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.25 : 0.2)
					},
					color: theme.palette.primary.main,
					transition: "all 0.3s ease"
				}}
				aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
				{isDark ? <Brightness7Icon /> : <Brightness4Icon />}
			</IconButton>
		</Tooltip>
	);
}

export default ThemeToggle;
