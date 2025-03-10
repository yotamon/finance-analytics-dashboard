import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "./design-system/styles.css"; // Import design system styles
import "./theme.css";
// Import leaflet CSS after Tailwind CSS to avoid conflicts
import "leaflet/dist/leaflet.css";
import { DataProvider } from "./context/DataContext";
import { UiProvider } from "./context/UiContext";
import { ConfigProvider } from "./context/ConfigContext";
import { ThemeProvider } from "./context/ThemeContext";
import { I18nProvider } from "./context/I18nContext";
import { CurrencyProvider } from "./context/CurrencyContext";
// Import Material UI ThemeProvider
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useMuiTheme } from "./theme/mui-theme";

// Theme initialization script
const initializeTheme = () => {
	// Check if there's a theme preference in localStorage
	const savedTheme = localStorage.getItem("theme") || localStorage.getItem("finance-analyzer-theme");
	if (savedTheme === "dark") {
		document.documentElement.classList.add("dark");
	} else if (savedTheme === "light") {
		document.documentElement.classList.remove("dark");
	} else {
		// If no preference, use system preference
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			document.documentElement.classList.add("dark");
		}
	}
};

// Initialize theme before app renders
initializeTheme();

// Material UI wrapper component
function MaterialUIWrapper({ children }) {
	// Add error handling for theme creation
	try {
		const muiTheme = useMuiTheme();

		// Make sure we have a valid theme before rendering
		if (!muiTheme) {
			/* eslint-disable-next-line no-console */
console.error("Failed to create Material UI theme. Using default theme.");
			return children;
		}

		return (
			<MuiThemeProvider theme={muiTheme}>
				<CssBaseline />
				{children}
			</MuiThemeProvider>
		);
	} catch (error) {
		/* eslint-disable-next-line no-console */
console.error("Error in MaterialUIWrapper:", error);
		// Fallback to rendering without MUI theme in case of error
		return children;
	}
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<ConfigProvider>
			<ThemeProvider>
				<I18nProvider>
					<CurrencyProvider>
						<UiProvider>
							<DataProvider>
								<BrowserRouter>
									<MaterialUIWrapper>
										<App />
									</MaterialUIWrapper>
								</BrowserRouter>
							</DataProvider>
						</UiProvider>
					</CurrencyProvider>
				</I18nProvider>
			</ThemeProvider>
		</ConfigProvider>
	</React.StrictMode>
);
