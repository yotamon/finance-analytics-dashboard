import React, { useState, useEffect, useRef } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Box, IconButton, Paper, Typography, useTheme, Avatar, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, CardHeader, Card, CardContent } from "@mui/material";
import { useI18n } from "../../context/I18nContext";
import {
	DragIndicator,
	ZoomOutMap,
	ZoomInMap,
	CloseFullscreen,
	OpenInFull,
	Close,
	BarChart as BarChartIcon,
	TableChart as TableChartIcon,
	Map as MapIcon,
	Timeline as TimelineIcon,
	PieChart as PieChartIcon,
	Assessment as AssessmentIcon,
	ShowChart as ShowChartIcon,
	BubbleChart as BubbleChartIcon,
	AccountTree as AccountTreeIcon,
	GridOn as GridOnIcon,
	MoreVert as MoreVertIcon,
	Refresh as RefreshIcon,
	AspectRatio as AspectRatioIcon,
	Download as DownloadIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { alpha } from "@mui/material/styles";

// Custom CSS to fix layout issues
const customStyles = {
	dashboardContainer: {
		width: "100%",
		position: "relative",
		minHeight: "800px", // Ensure container has minimum height
		overflow: "visible",
		marginBottom: "30px" // Add margin to bottom of container
	},
	chartPaper: {
		height: "100%",
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
		borderRadius: 3,
		boxShadow: 2,
		transition: "all 0.2s ease",
		position: "relative", // Add position relative for z-index to work
		zIndex: 1, // Default z-index
		"&:hover": {
			boxShadow: 8,
			zIndex: 10, // Higher z-index on hover to stay on top
			transform: "translateY(-4px)"
		},
		// Add styling to match inner cards
		padding: 0,
		background: theme => theme.palette.background.paper,
		// Add a gradient line at the top similar to ProjectTableCard
		"&::after": {
			content: '""',
			position: "absolute",
			top: 0,
			left: 0,
			width: "100%",
			height: "4px",
			background: theme => `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
			opacity: 0.7
		}
	},
	chartHeader: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "16px",
		paddingBottom: "8px",
		"& .MuiCardHeader-action": {
			alignSelf: "center",
			marginTop: 0,
			marginRight: 0
		}
	},
	chartTitle: {
		display: "flex",
		alignItems: "center",
		fontWeight: 600
	},
	chartIcon: {
		marginRight: 1.5,
		borderRadius: 2,
		padding: 1,
		display: "flex",
		color: theme => theme.palette.primary.main,
		backgroundColor: theme => alpha(theme.palette.primary.light, 0.2),
		transition: "all 0.2s ease",
		"&:hover": {
			transform: "scale(1.05)",
			backgroundColor: theme => alpha(theme.palette.primary.light, 0.3)
		}
	},
	chartContent: {
		flexGrow: 1,
		padding: 2,
		height: "calc(100% - 72px)",
		overflow: "auto"
	}
};

// Import chart components
import { RevenueEbitdaChart } from "../charts/RevenueEbitdaChart";
import { ProjectPortfolioChart } from "../charts/ProjectPortfolioChart";
import { ProjectTypeChart } from "../charts/ProjectTypeChart";
import { InvestmentReturnsChart } from "../charts/InvestmentReturnsChart";
import { EbitdaMarginChart } from "../charts/EbitdaMarginChart";
import { CountryComparisonChart } from "../charts/CountryComparisonChart";
import { GeographicMap } from "../charts/GeographicMap";
import ProjectTableCard from "./ProjectTableCard";
// Import new chart components
import CashFlowSankey from "../charts/CashFlowSankey";
import MetricsHeatMap from "../charts/MetricsHeatMap";
import CorrelationMatrix from "../charts/CorrelationMatrix";

// Make the GridLayout responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

// Chart Registry - Map chart types to their components
const CHART_COMPONENTS = {
	"revenue-ebitda": RevenueEbitdaChart,
	"project-portfolio": ProjectPortfolioChart,
	"project-type": ProjectTypeChart,
	"investment-returns": InvestmentReturnsChart,
	"ebitda-margin": EbitdaMarginChart,
	"country-comparison": CountryComparisonChart,
	"geographic-map": GeographicMap,
	"project-table": ProjectTableCard,
	// Add new chart types
	"cash-flow-sankey": CashFlowSankey,
	"metrics-heatmap": MetricsHeatMap,
	"correlation-matrix": CorrelationMatrix
};

// Chart type to icon mapping
const CHART_ICONS = {
	"revenue-ebitda": <ShowChartIcon fontSize="small" />,
	"project-portfolio": <TableChartIcon fontSize="small" />,
	"project-type": <PieChartIcon fontSize="small" />,
	"investment-returns": <BarChartIcon fontSize="small" />,
	"ebitda-margin": <TimelineIcon fontSize="small" />,
	"country-comparison": <AssessmentIcon fontSize="small" />,
	"geographic-map": <MapIcon fontSize="small" />,
	"project-table": <TableChartIcon fontSize="small" />,
	"cash-flow-sankey": <AccountTreeIcon fontSize="small" />,
	"metrics-heatmap": <GridOnIcon fontSize="small" />,
	"correlation-matrix": <BubbleChartIcon fontSize="small" />
};

// Default layout configuration
const DEFAULT_LAYOUTS = {
	lg: [
		{ i: "revenue-ebitda", x: 0, y: 0, w: 12, h: 6, minW: 6, minH: 4 },
		{ i: "project-portfolio", x: 0, y: 6, w: 6, h: 6, minW: 3, minH: 4 },
		{ i: "project-type", x: 6, y: 6, w: 6, h: 6, minW: 3, minH: 4 },
		{ i: "geographic-map", x: 0, y: 12, w: 12, h: 9, minW: 6, minH: 6 },
		{ i: "cash-flow-sankey", x: 0, y: 21, w: 12, h: 9, minW: 6, minH: 6 },
		{ i: "investment-returns", x: 0, y: 30, w: 4, h: 6, minW: 3, minH: 4 },
		{ i: "ebitda-margin", x: 4, y: 30, w: 4, h: 6, minW: 3, minH: 4 },
		{ i: "country-comparison", x: 8, y: 30, w: 4, h: 6, minW: 3, minH: 4 },
		{ i: "metrics-heatmap", x: 0, y: 36, w: 6, h: 8, minW: 3, minH: 6 },
		{ i: "correlation-matrix", x: 6, y: 36, w: 6, h: 8, minW: 3, minH: 6 },
		{ i: "project-table", x: 0, y: 44, w: 12, h: 8, minW: 6, minH: 6 }
	],
	md: [
		{ i: "revenue-ebitda", x: 0, y: 0, w: 10, h: 6, minW: 5, minH: 4 },
		{ i: "project-portfolio", x: 0, y: 6, w: 5, h: 6, minW: 3, minH: 4 },
		{ i: "project-type", x: 5, y: 6, w: 5, h: 6, minW: 3, minH: 4 },
		{ i: "geographic-map", x: 0, y: 12, w: 10, h: 8, minW: 5, minH: 6 },
		{ i: "cash-flow-sankey", x: 0, y: 20, w: 10, h: 8, minW: 5, minH: 6 },
		{ i: "investment-returns", x: 0, y: 28, w: 3, h: 6, minW: 3, minH: 4 },
		{ i: "ebitda-margin", x: 3, y: 28, w: 4, h: 6, minW: 3, minH: 4 },
		{ i: "country-comparison", x: 7, y: 28, w: 3, h: 6, minW: 3, minH: 4 },
		{ i: "metrics-heatmap", x: 0, y: 34, w: 5, h: 8, minW: 3, minH: 6 },
		{ i: "correlation-matrix", x: 5, y: 34, w: 5, h: 8, minW: 3, minH: 6 },
		{ i: "project-table", x: 0, y: 42, w: 10, h: 8, minW: 5, minH: 6 }
	],
	sm: [
		{ i: "revenue-ebitda", x: 0, y: 0, w: 6, h: 6, minW: 3, minH: 4 },
		{ i: "project-portfolio", x: 0, y: 6, w: 6, h: 6, minW: 3, minH: 4 },
		{ i: "project-type", x: 0, y: 12, w: 6, h: 6, minW: 3, minH: 4 },
		{ i: "geographic-map", x: 0, y: 18, w: 6, h: 8, minW: 3, minH: 6 },
		{ i: "cash-flow-sankey", x: 0, y: 26, w: 6, h: 8, minW: 3, minH: 6 },
		{ i: "investment-returns", x: 0, y: 34, w: 6, h: 6, minW: 3, minH: 4 },
		{ i: "ebitda-margin", x: 0, y: 40, w: 6, h: 6, minW: 3, minH: 4 },
		{ i: "country-comparison", x: 0, y: 46, w: 6, h: 6, minW: 3, minH: 4 },
		{ i: "metrics-heatmap", x: 0, y: 52, w: 6, h: 8, minW: 3, minH: 6 },
		{ i: "correlation-matrix", x: 0, y: 60, w: 6, h: 8, minW: 3, minH: 6 },
		{ i: "project-table", x: 0, y: 68, w: 6, h: 8, minW: 3, minH: 6 }
	],
	xs: [
		{ i: "revenue-ebitda", x: 0, y: 0, w: 4, h: 6, minW: 2, minH: 4 },
		{ i: "project-portfolio", x: 0, y: 6, w: 4, h: 6, minW: 2, minH: 4 },
		{ i: "project-type", x: 0, y: 12, w: 4, h: 6, minW: 2, minH: 4 },
		{ i: "geographic-map", x: 0, y: 18, w: 4, h: 8, minW: 2, minH: 6 },
		{ i: "cash-flow-sankey", x: 0, y: 26, w: 4, h: 8, minW: 2, minH: 6 },
		{ i: "investment-returns", x: 0, y: 34, w: 4, h: 6, minW: 2, minH: 4 },
		{ i: "ebitda-margin", x: 0, y: 40, w: 4, h: 6, minW: 2, minH: 4 },
		{ i: "country-comparison", x: 0, y: 46, w: 4, h: 6, minW: 2, minH: 4 },
		{ i: "metrics-heatmap", x: 0, y: 52, w: 4, h: 8, minW: 2, minH: 6 },
		{ i: "correlation-matrix", x: 0, y: 60, w: 4, h: 8, minW: 2, minH: 6 },
		{ i: "project-table", x: 0, y: 68, w: 4, h: 8, minW: 2, minH: 6 }
	],
	xxs: [
		{ i: "revenue-ebitda", x: 0, y: 0, w: 2, h: 6, minW: 1, minH: 4 },
		{ i: "project-portfolio", x: 0, y: 6, w: 2, h: 6, minW: 1, minH: 4 },
		{ i: "project-type", x: 0, y: 12, w: 2, h: 6, minW: 1, minH: 4 },
		{ i: "geographic-map", x: 0, y: 18, w: 2, h: 8, minW: 1, minH: 6 },
		{ i: "cash-flow-sankey", x: 0, y: 26, w: 2, h: 8, minW: 1, minH: 6 },
		{ i: "investment-returns", x: 0, y: 34, w: 2, h: 6, minW: 1, minH: 4 },
		{ i: "ebitda-margin", x: 0, y: 40, w: 2, h: 6, minW: 1, minH: 4 },
		{ i: "country-comparison", x: 0, y: 46, w: 2, h: 6, minW: 1, minH: 4 },
		{ i: "metrics-heatmap", x: 0, y: 52, w: 2, h: 8, minW: 1, minH: 6 },
		{ i: "correlation-matrix", x: 0, y: 60, w: 2, h: 8, minW: 1, minH: 6 },
		{ i: "project-table", x: 0, y: 68, w: 2, h: 8, minW: 1, minH: 6 }
	]
};

export default function DraggableDashboard({ financialData, projectData, countryData, editMode = false, onLayoutChange, savedLayouts = null }) {
	const theme = useTheme();
	const { t } = useI18n();
	const [layouts, setLayouts] = useState(savedLayouts || DEFAULT_LAYOUTS);
	const [maximizedChart, setMaximizedChart] = useState(null);
	const [activeCharts, setActiveCharts] = useState([]);
	const [mounted, setMounted] = useState(false);

	// Menu state for chart options
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);
	const [activeMenu, setActiveMenu] = useState(null);

	// Handle menu open
	const handleMenuOpen = (event, chartId) => {
		setMenuAnchorEl(event.currentTarget);
		setActiveMenu(chartId);
	};

	// Handle menu close
	const handleMenuClose = () => {
		setMenuAnchorEl(null);
		setActiveMenu(null);
	};

	// Initialize active charts from layouts
	useEffect(() => {
		// Extract all unique chart IDs from layouts
		const chartIds = new Set();
		Object.values(layouts).forEach(layout => {
			layout.forEach(item => chartIds.add(item.i));
		});
		setActiveCharts(Array.from(chartIds));

		// Set mounted to true after initial render to avoid layout jumping
		setMounted(true);
	}, []);

	// Effect to handle resize events
	useEffect(() => {
		if (!mounted) return;

		// Force layout recalculation on window resize
		const handleResize = () => {
			// Update layout after resize
			setTimeout(() => {
				setLayouts(prevLayouts => ({ ...prevLayouts }));
			}, 100);
		};

		window.addEventListener("resize", handleResize);

		// Force initial layout calculation after mounting
		setTimeout(() => {
			window.dispatchEvent(new Event("resize"));
		}, 500);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [mounted]);

	// Handle resize event
	const onResize = (layout, oldItem, newItem) => {
		// Force layout recalculation after resize
		setTimeout(() => {
			window.dispatchEvent(new Event("resize"));
		}, 200);
	};

	// Handle layout changes
	const handleLayoutChange = (currentLayout, allLayouts) => {
		setLayouts(allLayouts);
		if (onLayoutChange) {
			onLayoutChange(allLayouts);
		}

		// Force recalculation of charts
		setTimeout(() => {
			window.dispatchEvent(new Event("resize"));
		}, 100);
	};

	// Toggle maximized state for a chart
	const toggleMaximize = chartId => {
		setMaximizedChart(maximizedChart === chartId ? null : chartId);
	};

	// Render chart based on its type
	const renderChart = (chartId, passedData, isMaximized = false) => {
		const ChartComponent = CHART_COMPONENTS[chartId];

		if (!ChartComponent) {
			return (
				<Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
					<Typography color="error">Chart type not found: {chartId}</Typography>
				</Box>
			);
		}

		// Use passed data if available, otherwise use props
		const data = passedData || { financialData, projectData, countryData };

		// Determine which data to pass based on chart type
		let chartData;
		switch (chartId) {
			case "revenue-ebitda":
				chartData = data.financialData;
				break;
			case "geographic-map":
			case "project-portfolio":
			case "project-type":
			case "investment-returns":
				chartData = data.projectData;
				break;
			case "country-comparison":
				chartData = data.countryData;
				break;
			case "ebitda-margin":
				chartData = data.financialData;
				break;
			case "cash-flow-sankey":
				chartData = data.financialData;
				break;
			case "metrics-heatmap":
				chartData = data.projectData;
				break;
			case "correlation-matrix":
				chartData = data.projectData;
				break;
			case "project-table":
				// In maximized view, we want to show the full card
				return <ProjectTableCard projects={data.projectData} embedded={!isMaximized} />;
			default:
				chartData = data.projectData;
		}

		return <ChartComponent data={chartData} />;
	};

	// Maximized chart component
	const MaximizedChart = ({ chartId, data, onClose }) => {
		const theme = useTheme();
		const { t } = useI18n();

		return (
			<Card
				sx={{
					height: "calc(100vh - 120px)",
					position: "relative",
					overflow: "hidden",
					bgcolor: theme.palette.background.paper,
					borderRadius: 3,
					boxShadow: 3,
					p: 0,
					"&::after": {
						content: '""',
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "4px",
						background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
						opacity: 0.7
					}
				}}>
				{/* Maximized Chart Header */}
				<CardHeader
					title={
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Avatar
								sx={{
									mr: 1.5,
									color: theme.palette.primary.main,
									bgcolor: alpha(theme.palette.primary.light, 0.2),
									width: 36,
									height: 36
								}}
								variant="rounded">
								{CHART_ICONS[chartId]}
							</Avatar>
							<Box>
								<Typography variant="h6" fontWeight={600} noWrap>
									{t(`charts.${chartId.replace(/-/g, "")}.title`)}
								</Typography>
								<Typography variant="caption" color="text.secondary" noWrap>
									{t(`charts.${chartId.replace(/-/g, "")}.description`)}
								</Typography>
							</Box>
						</Box>
					}
					action={
						<Tooltip title={t("dashboard.close")}>
							<IconButton onClick={onClose} color="primary" size="small">
								<CloseFullscreen fontSize="small" />
							</IconButton>
						</Tooltip>
					}
					sx={{
						pb: 0,
						"& .MuiCardHeader-action": {
							alignSelf: "center",
							marginTop: 0,
							marginRight: 0
						}
					}}
				/>

				{/* Maximized Chart Content */}
				<CardContent
					sx={{
						height: "calc(100% - 76px)",
						p: chartId === "project-table" ? 0 : 3,
						display: "flex",
						alignItems: "center",
						justifyContent: "center"
					}}>
					{renderChart(chartId, data, true)}
				</CardContent>
			</Card>
		);
	};

	return (
		<Box sx={customStyles.dashboardContainer}>
			{maximizedChart ? (
				<MaximizedChart chartId={maximizedChart} data={{ financialData, projectData, countryData }} onClose={() => toggleMaximize(null)} />
			) : (
				<>
					{/* Render a hidden div that updates when mounted to force layout recalculation */}
					<Box sx={{ display: "none" }}>{mounted ? "mounted" : "not-mounted"}</Box>

					<ResponsiveGridLayout
						className="layout"
						layouts={layouts}
						breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
						cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
						rowHeight={60}
						margin={[20, 20]}
						containerPadding={[10, 10]}
						onLayoutChange={handleLayoutChange}
						isDraggable={editMode}
						isResizable={editMode}
						useCSSTransforms={mounted} // Only use CSS transforms when mounted
						measureBeforeMount={false}
						compactType="vertical"
						preventCollision={false}
						onResize={onResize}
						draggableHandle=".drag-handle"
						style={{ position: "relative", visibility: mounted ? "visible" : "hidden" }}>
						{activeCharts.map(chartId => (
							<Paper
								key={chartId}
								sx={{
									...customStyles.chartPaper,
									height: "100%",
									width: "100%",
									overflow: "hidden"
								}}
								component={motion.div}
								transition={{ duration: 0.2 }}>
								{/* Chart Title Bar */}
								<CardHeader
									title={
										<Box sx={{ display: "flex", alignItems: "center" }}>
											<Avatar
												sx={{
													mr: 1.5,
													color: theme.palette.primary.main,
													bgcolor: alpha(theme.palette.primary.light, 0.2),
													width: 32,
													height: 32
												}}
												variant="rounded">
												{CHART_ICONS[chartId]}
											</Avatar>
											<Box>
												<Typography variant="subtitle1" fontWeight={600} noWrap>
													{t(`charts.${chartId.replace(/-/g, "")}.title`)}
												</Typography>
												<Typography variant="caption" color="text.secondary" noWrap>
													{t(`charts.${chartId.replace(/-/g, "")}.description`)}
												</Typography>
											</Box>
										</Box>
									}
									action={
										<Box sx={{ display: "flex" }}>
											{editMode && (
												<Tooltip title={t("dashboard.drag")}>
													<IconButton size="small" sx={{ color: theme.palette.text.secondary, opacity: 0.7 }}>
														<DragIndicator fontSize="small" className="drag-handle" />
													</IconButton>
												</Tooltip>
											)}
											<Tooltip title={t("dashboard.maximize")}>
												<IconButton size="small" onClick={() => toggleMaximize(chartId)} sx={{ color: theme.palette.text.secondary }}>
													<AspectRatioIcon fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title={t("dashboard.options")}>
												<IconButton size="small" onClick={e => handleMenuOpen(e, chartId)} sx={{ color: theme.palette.text.secondary }}>
													<MoreVertIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									}
									sx={{
										pb: 0,
										"& .MuiCardHeader-action": {
											alignSelf: "center",
											marginTop: 0,
											marginRight: 0
										}
									}}
								/>

								{/* Chart Content Area */}
								<CardContent
									sx={{
										flexGrow: 1,
										p: chartId === "project-table" ? 0 : 2,
										pt: chartId === "project-table" ? 0 : 1,
										"&:last-child": { pb: 0 },
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										height: "calc(100% - 72px)",
										overflow: "auto"
									}}>
									{renderChart(chartId, { financialData, projectData, countryData })}
								</CardContent>
							</Paper>
						))}
					</ResponsiveGridLayout>
				</>
			)}

			{/* Chart Options Menu */}
			<Menu
				anchorEl={menuAnchorEl}
				open={Boolean(menuAnchorEl)}
				onClose={handleMenuClose}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				PaperProps={{
					elevation: 3,
					sx: {
						mt: 1,
						overflow: "visible",
						filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.12))",
						"&:before": {
							content: '""',
							display: "block",
							position: "absolute",
							top: 0,
							right: 14,
							width: 10,
							height: 10,
							bgcolor: "background.paper",
							transform: "translateY(-50%) rotate(45deg)",
							zIndex: 0
						}
					}
				}}>
				<MenuItem
					onClick={() => {
						toggleMaximize(activeMenu);
						handleMenuClose();
					}}>
					<ListItemIcon>
						<AspectRatioIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText primary={t("dashboard.maximize")} />
				</MenuItem>
				<MenuItem onClick={handleMenuClose}>
					<ListItemIcon>
						<RefreshIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText primary={t("dashboard.refresh")} />
				</MenuItem>
				<MenuItem onClick={handleMenuClose}>
					<ListItemIcon>
						<DownloadIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText primary={t("dashboard.download")} />
				</MenuItem>
			</Menu>
		</Box>
	);
}
