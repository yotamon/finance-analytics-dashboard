import React from "react";
import { Box, Skeleton, Paper, Typography, useTheme } from "@mui/material";

/**
 * ChartSkeleton - A component that displays a loading skeleton for charts
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Optional chart title
 * @param {number} props.height - Height of the skeleton chart (default: 300px)
 * @param {string} props.type - Type of chart (bar, line, pie) to slightly adjust the skeleton
 * @returns {JSX.Element} Skeleton representation of a loading chart
 */
function ChartSkeleton({ title, height = 300, type = "bar" }) {
	const theme = useTheme();

	const renderChartSkeleton = () => {
		switch (type) {
			case "pie":
				return (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "100%",
							pt: 2,
							pb: 4
						}}>
						<Skeleton variant="circular" width="60%" height={height * 0.7} />
					</Box>
				);

			case "line":
				return (
					<Box sx={{ pt: 2, pb: 4, px: 3, height: "100%" }}>
						{/* X-axis */}
						<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, mt: "auto" }}>
							{[...Array(5)].map((_, i) => (
								<Skeleton key={i} variant="text" width={40} height={20} />
							))}
						</Box>

						{/* Chart area */}
						<Skeleton variant="rectangular" width="100%" height={height * 0.7} sx={{ borderRadius: 1, mb: 3 }} />

						{/* Legend */}
						<Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
							{[...Array(3)].map((_, i) => (
								<Box key={i} sx={{ display: "flex", alignItems: "center" }}>
									<Skeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: 0.5, mr: 1 }} />
									<Skeleton variant="text" width={50} height={24} />
								</Box>
							))}
						</Box>
					</Box>
				);

			// Bar chart or default
			default:
				return (
					<Box sx={{ pt: 2, pb: 4, px: 3, height: "100%" }}>
						{/* Y-axis */}
						<Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", position: "absolute", left: 16, height: height * 0.7, top: 60 }}>
							{[...Array(4)].map((_, i) => (
								<Skeleton key={i} variant="text" width={30} height={20} />
							))}
						</Box>

						{/* Chart area with bars */}
						<Box sx={{ ml: 5, height: height * 0.7, display: "flex", alignItems: "flex-end", gap: 2 }}>
							{[...Array(6)].map((_, i) => (
								<Skeleton key={i} variant="rectangular" width="12%" height={`${20 + Math.random() * 80}%`} sx={{ borderRadius: "4px 4px 0 0" }} />
							))}
						</Box>

						{/* X-axis */}
						<Box sx={{ display: "flex", justifyContent: "space-around", ml: 5, mt: 1 }}>
							{[...Array(6)].map((_, i) => (
								<Skeleton key={i} variant="text" width={40} height={20} />
							))}
						</Box>

						{/* Legend */}
						<Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 3 }}>
							{[...Array(2)].map((_, i) => (
								<Box key={i} sx={{ display: "flex", alignItems: "center" }}>
									<Skeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: 0.5, mr: 1 }} />
									<Skeleton variant="text" width={60} height={24} />
								</Box>
							))}
						</Box>
					</Box>
				);
		}
	};

	return (
		<Paper
			elevation={1}
			sx={{
				height: height,
				borderRadius: 2,
				overflow: "hidden",
				position: "relative",
				p: 2,
				backgroundColor: theme.palette.background.paper
			}}>
			{/* Chart title */}
			{title && (
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
					<Typography variant="h6" color="text.secondary">
						<Skeleton variant="text" width={200} height={32} />
					</Typography>
					<Box sx={{ display: "flex", gap: 1 }}>
						<Skeleton variant="rounded" width={32} height={32} />
						<Skeleton variant="rounded" width={32} height={32} />
					</Box>
				</Box>
			)}

			{renderChartSkeleton()}
		</Paper>
	);
}

export default ChartSkeleton;
