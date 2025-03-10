import { ArrowUpward, ArrowDownward, HelpOutline } from "@mui/icons-material";
import { Card, CardContent, Typography, Box, alpha, Skeleton, Chip, useTheme } from "@mui/material";

function KpiCard({ title, value, renderValue, change, trend, isLoading, icon: Icon, gradient = "" }) {
	const theme = useTheme();
	const isPositive = trend === "up";

	// Map string gradient descriptors to actual gradient values
	const getGradientColors = gradientKey => {
		const gradientMap = {
			"from-blue-500 to-indigo-600": `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
			"from-emerald-500 to-green-600": `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
			"from-amber-500 to-yellow-600": `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
			"from-purple-500 to-violet-600": `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
		};

		return gradientMap[gradientKey] || gradientMap["from-blue-500 to-indigo-600"];
	};

	// Set default gradient if none provided, using MUI theme colors
	const cardGradient = getGradientColors(gradient);

	if (isLoading) {
		return (
			<Card
				elevation={2}
				sx={{
					height: "100%",
					p: 3,
					borderRadius: 3,
					backgroundColor: alpha(theme.palette.background.paper, 0.8),
					backdropFilter: "blur(8px)"
				}}>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
					<Skeleton variant="text" width={120} height={20} />
					<Skeleton variant="circular" width={24} height={24} />
				</Box>
				<Skeleton variant="text" width={160} height={32} sx={{ mb: 0.5 }} />
				<Skeleton variant="text" width={80} height={20} />
			</Card>
		);
	}

	return (
		<Card
			elevation={2}
			sx={{
				height: "100%",
				p: 3,
				borderRadius: 3,
				backgroundColor: alpha(theme.palette.background.paper, 0.8),
				backdropFilter: "blur(8px)",
				transition: "box-shadow 0.3s ease, transform 0.3s ease",
				position: "relative",
				overflow: "hidden",
				"&:hover": {
					boxShadow: theme.shadows[8],
					transform: "translateY(-4px)"
				},
				"&::before": {
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					width: "6px",
					height: "100%",
					background: cardGradient,
					borderTopLeftRadius: "inherit",
					borderBottomLeftRadius: "inherit"
				}
			}}>
			<CardContent sx={{ p: 0, position: "relative", zIndex: 1 }}>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						{Icon && (
							<Box
								sx={{
									mr: 1.5,
									color: "white",
									background: cardGradient,
									p: 1.25,
									borderRadius: 1.5,
									display: "flex",
									boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
									transition: "transform 0.3s ease, box-shadow 0.3s ease",
									"&:hover": {
										transform: "scale(1.05)",
										boxShadow: "0 6px 16px rgba(0,0,0,0.2)"
									}
								}}>
								<Icon size={20} />
							</Box>
						)}
						<Typography variant="body2" color="text.secondary" fontWeight={500}>
							{title}
						</Typography>
					</Box>

					{change && (
						<Chip
							size="small"
							icon={isPositive ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
							label={change}
							color={isPositive ? "success" : "error"}
							sx={{
								height: 24,
								backgroundColor: alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.1),
								color: isPositive ? theme.palette.success.main : theme.palette.error.main,
								fontWeight: 600,
								borderRadius: 1.5,
								"& .MuiChip-icon": {
									fontSize: "0.8rem",
									ml: 0.5
								}
							}}
						/>
					)}
				</Box>

				<Typography variant="h4" component="p" fontWeight="bold" sx={{ mt: 2.5, mb: 1 }}>
					{renderValue ? renderValue() : value}
				</Typography>

				{/* Accent line with gradient */}
				<Box
					sx={{
						width: "4rem",
						height: "0.25rem",
						mt: 1,
						borderRadius: "4px",
						background: cardGradient,
						opacity: 0.75
					}}
				/>

				{/* Tooltip/info text */}
				<Box sx={{ mt: 1.5, display: "flex", alignItems: "center" }}>
					<HelpOutline sx={{ fontSize: 14, mr: 0.5, color: theme.palette.text.disabled }} />
					<Typography variant="caption" color="text.disabled">
						Compared to previous period
					</Typography>
				</Box>
			</CardContent>
		</Card>
	);
}

export default KpiCard;
