import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import ExportPage from "./pages/ExportPage";
import Settings from "./pages/Settings";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useData } from "./context/DataContext";
import { useConfig } from "./context/ConfigContext";
import { useI18n } from "./context/I18nContext";
import { useTheme } from "./context/ThemeContext";
import DesignSystemDemo from "./components/DesignSystemDemo";
import MuiDesignSystemDemo from "./components/MuiDesignSystemDemo";
import { RechartsLoader } from "./components/charts/RechartsLoader";
import { Box, useTheme as useMuiTheme } from "@mui/material";

// Wrapper component to access context
function AppContent() {
	const { hasData } = useData();
	const { isFeatureEnabled } = useConfig();
	const { t } = useI18n();
	const { theme, isDark } = useTheme();
	const muiTheme = useMuiTheme();

	// Check if export feature is enabled
	const exportEnabled = isFeatureEnabled("DataExport");

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
				bgcolor: muiTheme.palette.background.default,
				color: muiTheme.palette.text.primary,
				position: "relative"
			}}>
			<Header />
			<Box component="main" sx={{ flexGrow: 1, position: "relative", zIndex: 1 }}>
				{/* Background gradient accent - using MUI themes */}
				<Box
					sx={{
						position: "absolute",
						inset: 0,
						background: isDark ? "linear-gradient(to bottom, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6))" : "linear-gradient(to bottom, rgba(238, 242, 255, 0.8), rgba(249, 250, 251, 0.8))",
						pointerEvents: "none",
						zIndex: 0
					}}
					aria-hidden="true"
				/>

				{/* Optional decorative element - using MUI themes */}
				<Box
					sx={{
						position: "absolute",
						top: 0,
						right: 0,
						width: "25%",
						height: "16rem",
						borderBottomLeftRadius: "100%",
						opacity: 0.1,
						transform: "translate(33%, -50%)",
						bgcolor: isDark ? muiTheme.palette.primary.main : muiTheme.palette.primary.light,
						pointerEvents: "none",
						zIndex: 0
					}}
					aria-hidden="true"
				/>

				<Routes>
					{/* Default route redirects to dashboard if data is present, otherwise to upload */}
					<Route path="/" element={hasData ? <Navigate to="/dashboard" replace /> : <Navigate to="/upload" replace />} />

					{/* Main routes */}
					<Route path="/dashboard" element={hasData ? <Dashboard /> : <Navigate to="/upload" replace />} />
					<Route path="/upload" element={<Upload />} />
					<Route path="/settings" element={<Settings />} />

					{/* Design System Demo routes */}
					<Route path="/design-system" element={<DesignSystemDemo />} />
					<Route path="/mui-demo" element={<MuiDesignSystemDemo />} />

					{/* Export route - only accessible if feature is enabled */}
					{exportEnabled && <Route path="/export" element={hasData ? <ExportPage /> : <Navigate to="/upload" replace />} />}

					{/* Catch-all route for 404 */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Box>
			<Footer />
		</Box>
	);
}

// Main App component with all providers
function App() {
	return (
		<RechartsLoader>
			<AppContent />
		</RechartsLoader>
	);
}

export default App;
