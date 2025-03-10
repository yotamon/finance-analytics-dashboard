import React, { useEffect, useState } from "react";
import { Box, LinearProgress, Typography, Paper, alpha, useTheme } from "@mui/material";
import { DataLoadingState } from "../../context/DataContext";

/**
 * A component that displays a loading progress bar with status text
 *
 * @param {Object} props
 * @param {string} props.loadingState - Current loading state
 * @param {number} props.progress - Loading progress (0-100)
 * @param {string} props.message - Optional custom message to display
 * @param {boolean} props.autoHide - Whether to automatically hide when done
 * @returns {JSX.Element}
 */
function LoadingProgressBar({ loadingState, progress, message, autoHide = true }) {
	const theme = useTheme();
	const [visible, setVisible] = useState(true);

	// Auto-hide the progress bar after loading completes
	useEffect(() => {
		if (autoHide && loadingState === DataLoadingState.SUCCESS) {
			const timer = setTimeout(() => setVisible(false), 1500);
			return () => clearTimeout(timer);
		}

		if (loadingState !== DataLoadingState.SUCCESS) {
			setVisible(true);
		}
	}, [loadingState, autoHide]);

	// Don't render anything when invisible
	if (!visible) return null;

	// Don't show for idle state
	if (loadingState === DataLoadingState.IDLE) return null;

	// Determine color based on state
	const getProgressColor = () => {
		switch (loadingState) {
			case DataLoadingState.ERROR:
				return theme.palette.error.main;
			case DataLoadingState.SUCCESS:
				return theme.palette.success.main;
			default:
				return theme.palette.primary.main;
		}
	};

	// Get message based on loading state
	const getStateMessage = () => {
		if (message) return message;

		switch (loadingState) {
			case DataLoadingState.LOADING:
				return "Loading data...";
			case DataLoadingState.PROCESSING:
				return "Processing data...";
			case DataLoadingState.SUCCESS:
				return "Data loaded successfully!";
			case DataLoadingState.ERROR:
				return "Error loading data";
			default:
				return "Preparing...";
		}
	};

	return (
		<Paper
			elevation={3}
			sx={{
				position: "fixed",
				bottom: 24,
				left: "50%",
				transform: "translateX(-50%)",
				width: { xs: "90%", sm: 400 },
				maxWidth: 500,
				p: 2,
				borderRadius: 2,
				backgroundColor: alpha(theme.palette.background.paper, 0.95),
				backdropFilter: "blur(8px)",
				boxShadow: theme.shadows[10],
				zIndex: 9999,
				transition: "all 0.3s ease-in-out",
				animation: loadingState === DataLoadingState.SUCCESS ? "fadeOut 1.5s ease-in-out forwards" : "slideIn 0.3s ease-out",
				"@keyframes slideIn": {
					"0%": { transform: "translate(-50%, 100%)" },
					"100%": { transform: "translate(-50%, 0)" }
				},
				"@keyframes fadeOut": {
					"0%": { opacity: 1 },
					"70%": { opacity: 1 },
					"100%": { opacity: 0 }
				}
			}}>
			<Box sx={{ mb: 1 }}>
				<Typography variant="body2" color="text.secondary" fontWeight={500}>
					{getStateMessage()}
				</Typography>
				<Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
					{progress.toFixed(0)}%
				</Typography>
			</Box>

			<LinearProgress
				variant="determinate"
				value={progress}
				sx={{
					height: 8,
					borderRadius: 4,
					backgroundColor: alpha(getProgressColor(), 0.15),
					"& .MuiLinearProgress-bar": {
						backgroundColor: getProgressColor(),
						transition: "transform 0.4s ease"
					}
				}}
			/>

			{/* Optional extra info/status */}
			{loadingState === DataLoadingState.PROCESSING && (
				<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
					Analyzing and optimizing data structures...
				</Typography>
			)}

			{loadingState === DataLoadingState.ERROR && (
				<Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
					Please try again or contact support if the issue persists.
				</Typography>
			)}
		</Paper>
	);
}

export default LoadingProgressBar;
