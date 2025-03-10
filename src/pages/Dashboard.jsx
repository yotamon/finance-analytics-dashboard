import { useState, useEffect, useMemo } from "react";
import { Download, Filter, Info, ChevronDown, BarChart2, PieChart, MapPin, TrendingUp, LayoutDashboard, RefreshCw } from "lucide-react";
import { useData } from "../context/DataContext";
import Container from "../components/layout/Container";
import KpiContainer from "../components/dashboard/KpiContainer";
import ChartContainer from "../components/dashboard/ChartContainer";
import ExportMenu from "../components/dashboard/ExportMenu";
import FilterMenu from "../components/dashboard/FilterMenu";
import ProjectTableCard from "../components/dashboard/ProjectTableCard";
import { RevenueEbitdaChart } from "../components/charts/RevenueEbitdaChart";
import { ProjectPortfolioChart } from "../components/charts/ProjectPortfolioChart";
import { ProjectTypeChart } from "../components/charts/ProjectTypeChart";
import { InvestmentReturnsChart } from "../components/charts/InvestmentReturnsChart";
import { EbitdaMarginChart } from "../components/charts/EbitdaMarginChart";
import { CountryComparisonChart } from "../components/charts/CountryComparisonChart";
import { GeographicMap } from "../components/charts/GeographicMap";
import { useI18n } from "../context/I18nContext";
import { useTheme } from "../context/ThemeContext";
import useVirtualData from "../hooks/useVirtualData";
import { DataLoadingState } from "../context/DataContext";
import LoadingProgressBar from "../components/ui/LoadingProgressBar";

// Material UI imports
import { Box, Button, Typography, Grid, Paper, IconButton, Chip, useTheme as useMuiTheme, alpha, TablePagination, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

// Default data for preview when no file is uploaded
const defaultProjects = [
	{
		name: "Urleasca 2",
		type: "On-shore Wind",
		country: "Romania",
		status: "Planning",
		capacity: 78,
		investmentCost: 102,
		equity: 31,
		revenue: 16,
		ebitda: 15,
		profit: 9,
		yieldOnCost: 0.15,
		irr: 0.281,
		cashReturn: 71,
		location: [27.6744, 45.7489]
	},
	{
		name: "Seaca",
		type: "On-shore Wind",
		country: "Romania",
		status: "Planning",
		capacity: 132,
		investmentCost: 166,
		equity: 50,
		revenue: 26,
		ebitda: 23,
		profit: 14,
		yieldOnCost: 0.14,
		irr: 0.318,
		cashReturn: 107,
		location: [24.3504, 44.3223]
	},
	{
		name: "Negotino",
		type: "Solar Ground",
		country: "N.Macedonia",
		status: "Planning",
		capacity: 111,
		investmentCost: 65,
		equity: 19,
		revenue: 9,
		ebitda: 8,
		profit: 5,
		yieldOnCost: 0.13,
		irr: 0.282,
		cashReturn: 43,
		location: [22.0888, 41.4834]
	},
	{
		name: "Bitola",
		type: "Solar Ground",
		country: "N.Macedonia",
		status: "Planning",
		capacity: 57,
		investmentCost: 36,
		equity: 11,
		revenue: 5,
		ebitda: 5,
		profit: 3,
		yieldOnCost: 0.13,
		irr: 0.268,
		cashReturn: 24,
		location: [21.3433, 41.0297]
	},
	{
		name: "Shivacevo",
		type: "Solar Ground",
		country: "Bulgaria",
		status: "Planning",
		capacity: 86,
		investmentCost: 62,
		equity: 19,
		revenue: 9,
		ebitda: 9,
		profit: 6,
		yieldOnCost: 0.14,
		irr: 0.293,
		cashReturn: 45,
		location: [26.0241, 42.6816]
	},
	{
		name: "Hadjicica",
		type: "Solar Ground",
		country: "Serbia",
		status: "Planning",
		capacity: 125,
		investmentCost: 75,
		equity: 23,
		revenue: 10,
		ebitda: 10,
		profit: 6,
		yieldOnCost: 0.13,
		irr: 0.264,
		cashReturn: 49,
		location: [20.4651, 44.8048]
	}
];

// Default country totals
const defaultCountryTotals = [
	{ country: "Romania", capacity: 210, investment: 268 },
	{ country: "N.Macedonia", capacity: 168, investment: 101 },
	{ country: "Bulgaria", capacity: 86, investment: 62 },
	{ country: "Serbia", capacity: 125, investment: 75 },
	{ country: "Greece", capacity: 134, investment: 149 }
];

function Dashboard() {
	const { data, isLoading, loadingState, loadingProgress } = useData();
	const [showExportMenu, setShowExportMenu] = useState(false);
	const [showFilterMenu, setShowFilterMenu] = useState(false);
	const { t } = useI18n();
	const { isDark } = useTheme();
	const muiTheme = useMuiTheme();

	// Add state to track visible charts
	const [visibleCharts, setVisibleCharts] = useState({
		revenueEbitda: true,
		portfolioOverview: true,
		projectType: true,
		geographicDistribution: true,
		investmentReturns: true,
		ebitdaMargin: true,
		countryComparison: true,
		projectPortfolio: true
	});

	// Add state to track card sizes
	const [cardSizes, setCardSizes] = useState({
		revenueEbitda: "full", // Default is full width for this chart
		portfolioOverview: "1/2", // Default is half width for this chart
		projectType: "1/2", // Default is half width for this chart
		geographicDistribution: "full", // Default is full width for this chart
		investmentReturns: "1/3", // Default is 1/3 width for this chart
		ebitdaMargin: "1/3", // Default is 1/3 width for this chart
		countryComparison: "1/3" // Default is 1/3 width for this chart
	});

	// Use our virtual data hook for project data
	const {
		data: paginatedProjects,
		totalCount: totalProjects,
		page,
		rowsPerPage,
		handleChangePage,
		handleChangeRowsPerPage,
		handleFilter,
		filterParams,
		resetFilters
	} = useVirtualData(data?.projects || [], {
		pageSize: 10,
		filterFunction: (item, filters) => {
			// Skip filtering if no filters applied
			if (Object.keys(filters).length === 0) return true;

			// Check type filter
			if (filters.type && item.type !== filters.type) return false;

			// Check country filter
			if (filters.country && item.country !== filters.country) return false;

			// Check status filter
			if (filters.status && item.status !== filters.status) return false;

			// Check capacity range
			if (filters.capacityMin && item.capacity < filters.capacityMin) return false;
			if (filters.capacityMax && item.capacity > filters.capacityMax) return false;

			// All filters passed
			return true;
		}
	});

	// Get actual data or fallback to defaults - ensuring data is always available
	const projectData = data?.projects || defaultProjects;
	const financialData = data?.financialProjections || {
		years: [2024, 2025, 2026, 2027, 2028, 2029, 2030],
		revenues: [0, 16.1, 98.5, 99.1, 99.7, 100.4, 101.0],
		ebitda: [0, 14.8, 89.5, 90.1, 90.7, 91.3, 91.9]
	};
	// Ensure countryData is always an array
	const countryData = Array.isArray(data?.countryTotals) ? data.countryTotals : defaultCountryTotals;

	// Handle chart export data event
	useEffect(() => {
		const handleExportData = event => {
			const { chartTitle } = event.detail;
			let dataToExport;
			let filename;

			// Determine which data to export based on chart title
			switch (chartTitle) {
				case "Revenue & EBITDA Projection":
					dataToExport = financialData;
					filename = "revenue-ebitda-projection.json";
					break;
				case "Project Portfolio Overview":
					dataToExport = projectData;
					filename = "project-portfolio.json";
					break;
				case "Project Type Breakdown":
					dataToExport = projectData;
					filename = "project-type-breakdown.json";
					break;
				case "Geographic Distribution":
					dataToExport = projectData.map(p => ({ name: p.name, country: p.country, location: p.location }));
					filename = "geographic-distribution.json";
					break;
				case "Investment Returns by Project":
					dataToExport = projectData.map(p => ({ name: p.name, irr: p.irr, yieldOnCost: p.yieldOnCost, cashReturn: p.cashReturn }));
					filename = "investment-returns.json";
					break;
				case "EBITDA Margin Progression":
					dataToExport = financialData;
					filename = "ebitda-margin.json";
					break;
				case "Country Comparison":
					dataToExport = countryData;
					filename = "country-comparison.json";
					break;
				default:
					dataToExport = {};
					filename = "chart-data.json";
			}

			// Create and download the file
			const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			link.click();
			URL.revokeObjectURL(url);
		};

		document.addEventListener("exportChartData", handleExportData);

		return () => {
			document.removeEventListener("exportChartData", handleExportData);
		};
	}, [projectData, financialData, countryData]);

	// Function to handle hiding a chart
	const handleHideChart = chartId => {
		setVisibleCharts(prev => ({
			...prev,
			[chartId]: false
		}));
	};

	// Function to handle resizing a chart
	const handleResizeCard = (chartId, size) => {
		setCardSizes(prev => ({
			...prev,
			[chartId]: size
		}));
	};

	// Get grid column class based on card size
	const getGridSpan = size => {
		switch (size) {
			case "full":
				return 12;
			case "1/2":
				return 6;
			case "1/3":
				return 4;
			default:
				return 6;
		}
	};

	// Optimized rendering for the stats section
	const renderStats = useMemo(() => {
		return (
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12}>
					<KpiContainer />
				</Grid>
			</Grid>
		);
	}, [data?.kpis]);

	// Add table pagination controls
	const renderTablePagination = () => (
		<Box
			sx={{
				display: "flex",
				justifyContent: "flex-end",
				alignItems: "center",
				width: "100%"
			}}>
			<TablePagination
				component="div"
				count={totalProjects}
				page={page}
				onPageChange={handleChangePage}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				rowsPerPageOptions={[5, 10, 25, 50]}
				labelRowsPerPage="Rows:"
				sx={{
					".MuiTablePagination-selectLabel": {
						fontWeight: 500
					},
					".MuiTablePagination-displayedRows": {
						fontWeight: 500
					}
				}}
			/>
		</Box>
	);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: "background.default",
				position: "relative",
				"&:before": {
					content: '""',
					position: "absolute",
					inset: 0,
					background: theme =>
						isDark
							? `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.dark, 0.15)}, transparent 25%),
						   radial-gradient(circle at 80% 60%, ${alpha(theme.palette.secondary.dark, 0.15)}, transparent 30%)`
							: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.light, 0.15)}, transparent 25%),
						   radial-gradient(circle at 80% 60%, ${alpha(theme.palette.secondary.light, 0.15)}, transparent 30%)`,
					backgroundImage: isDark
						? 'url(\'data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23333" fill-opacity="0.1" fill-rule="evenodd"/%3E%3C/svg%3E\')'
						: 'url(\'data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ddd" fill-opacity="0.1" fill-rule="evenodd"/%3E%3C/svg%3E\')',
					backgroundSize: "200px 200px",
					pointerEvents: "none",
					zIndex: 0,
					opacity: 0.5
				}
			}}>
			<Container sx={{ py: 5 }}>
				{/* Showing loading progress */}
				{loadingState !== DataLoadingState.IDLE && <LoadingProgressBar loadingState={loadingState} progress={loadingProgress} />}

				{/* Dashboard Header */}
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						justifyContent: "space-between",
						alignItems: { xs: "flex-start", md: "center" },
						mb: 4,
						gap: 2,
						animation: "fadeIn 0.8s ease-out"
					}}>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Paper
							elevation={3}
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								p: 1.5,
								mr: 2,
								borderRadius: 2,
								background: theme => `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
								animation: "pulse 3s infinite ease-in-out",
								boxShadow: theme => `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
							}}>
							<LayoutDashboard size={24} color="white" />
						</Paper>
						<Box>
							<Typography
								variant="h4"
								fontWeight="700"
								gutterBottom
								sx={{
									color: "text.primary",
									mb: 0.5,
									letterSpacing: "-0.01em"
								}}>
								{t("dashboard.title") || "Financial Dashboard"}
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
								<Typography variant="body2">
									{t("dashboard.lastUpdated") || "Last updated"}: {new Date().toLocaleDateString()}
								</Typography>
								<Box
									component="span"
									sx={{
										width: "4px",
										height: "4px",
										borderRadius: "50%",
										bgcolor: "divider",
										mx: 1
									}}
								/>
								<Box sx={{ display: "flex", alignItems: "center", color: "success.main" }}>
									<RefreshIcon fontSize="small" sx={{ mr: 0.5 }} />
									<Typography variant="body2">{t("dashboard.liveData") || "Live Data"}</Typography>
								</Box>
							</Box>
						</Box>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2, alignSelf: { xs: "flex-end", md: "auto" } }}>
						<Button
							variant="outlined"
							startIcon={<FilterAltIcon />}
							onClick={() => setShowFilterMenu(!showFilterMenu)}
							sx={{
								position: "relative",
								borderRadius: 2,
								px: 2,
								py: 1,
								transition: "all 0.2s ease",
								borderColor: theme => alpha(theme.palette.primary.main, 0.5),
								"&:hover": {
									borderColor: "primary.main",
									bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
									transform: "translateY(-2px)"
								}
							}}>
							{t("dashboard.filterData") || "Filter Data"}
							{showFilterMenu && <FilterMenu onClose={() => setShowFilterMenu(false)} />}
						</Button>
						<Button
							variant="outlined"
							startIcon={<FileDownloadIcon />}
							onClick={() => setShowExportMenu(!showExportMenu)}
							sx={{
								position: "relative",
								borderRadius: 2,
								px: 2,
								py: 1,
								transition: "all 0.2s ease",
								borderColor: theme => alpha(theme.palette.primary.main, 0.5),
								"&:hover": {
									borderColor: "primary.main",
									bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
									transform: "translateY(-2px)"
								}
							}}>
							{t("dashboard.export") || "Export"}
							{showExportMenu && <ExportMenu onClose={() => setShowExportMenu(false)} />}
						</Button>
					</Box>
				</Box>

				{/* Stats section */}
				{renderStats}

				{/* Rest of the dashboard layout */}
				<Grid container spacing={3}>
					{/* Use the paginated data for the project table */}
					<Grid item xs={12} sx={{ mb: 3, display: visibleCharts.projectPortfolio ? "block" : "none" }}>
						<ProjectTableCard
							projects={paginatedProjects}
							pagination={renderTablePagination()}
							onHide={() => {
								setVisibleCharts({
									...visibleCharts,
									projectPortfolio: false
								});
							}}
							onResizeCard={size => {
								// Optional: Handle resizing if needed
								console.log("Project portfolio resizing to:", size);
							}}
							filterParams={filterParams}
							handleFilter={handleFilter}
							resetFilters={resetFilters}
						/>
					</Grid>

					{/* Charts Section */}
					<Box id="dashboard-charts" sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
						{/* Main Charts Grid */}
						<Grid container spacing={4}>
							{/* Revenue & EBITDA Chart */}
							{visibleCharts.revenueEbitda && (
								<Grid
									item
									xs={12}
									lg={getGridSpan(cardSizes.revenueEbitda)}
									sx={{
										transform: "translateY(0)",
										transition: "transform 0.5s ease, opacity 0.5s ease",
										animation: "fadeIn 0.8s ease-out",
										animationDelay: "0.2s"
									}}>
									<ChartContainer
										title={t("charts.revenueEbitda.title") || "Revenue & EBITDA Projection"}
										description={t("charts.revenueEbitda.description") || "Showing exponential growth from 2025-2026 as projects come online"}
										icon={BarChart2}
										onHide={() => handleHideChart("revenueEbitda")}
										onResizeCard={size => handleResizeCard("revenueEbitda", size)}>
										<Box sx={{ width: "100%", height: 300 }}>
											<RevenueEbitdaChart data={financialData} />
										</Box>
									</ChartContainer>
								</Grid>
							)}

							{/* Project Portfolio Chart */}
							{visibleCharts.portfolioOverview && (
								<Grid
									item
									xs={12}
									lg={getGridSpan(cardSizes.portfolioOverview)}
									sx={{
										transform: "translateY(0)",
										transition: "transform 0.5s ease, opacity 0.5s ease",
										animation: "fadeIn 0.8s ease-out",
										animationDelay: "0.3s"
									}}>
									<ChartContainer
										title={t("charts.portfolioOverview.title") || "Project Portfolio Overview"}
										description={t("charts.portfolioOverview.description") || "Investment size vs. capacity vs. expected returns"}
										icon={TrendingUp}
										onHide={() => handleHideChart("portfolioOverview")}
										onResizeCard={size => handleResizeCard("portfolioOverview", size)}>
										<Box sx={{ width: "100%", height: 300 }}>
											<ProjectPortfolioChart data={projectData} />
										</Box>
									</ChartContainer>
								</Grid>
							)}

							{/* Project Type Chart */}
							{visibleCharts.projectType && (
								<Grid
									item
									xs={12}
									lg={getGridSpan(cardSizes.projectType)}
									sx={{
										transform: "translateY(0)",
										transition: "transform 0.5s ease, opacity 0.5s ease",
										animation: "fadeIn 0.8s ease-out",
										animationDelay: "0.4s"
									}}>
									<ChartContainer
										title={t("charts.projectType.title") || "Project Type Breakdown"}
										description={t("charts.projectType.description") || "Distribution between wind and solar capacity"}
										icon={PieChart}
										onHide={() => handleHideChart("projectType")}
										onResizeCard={size => handleResizeCard("projectType", size)}>
										<Box sx={{ width: "100%", height: 300 }}>
											<ProjectTypeChart data={projectData} />
										</Box>
									</ChartContainer>
								</Grid>
							)}

							{/* Geographic Map */}
							{visibleCharts.geographicDistribution && (
								<Grid
									item
									xs={12}
									lg={getGridSpan(cardSizes.geographicDistribution)}
									sx={{
										transform: "translateY(0)",
										transition: "transform 0.5s ease, opacity 0.5s ease",
										animation: "fadeIn 0.8s ease-out",
										animationDelay: "0.5s"
									}}>
									<ChartContainer
										title={t("charts.geographicDistribution.title") || "Geographic Distribution"}
										description={t("charts.geographicDistribution.description") || "Project locations and regional investments"}
										icon={MapPin}
										onHide={() => handleHideChart("geographicDistribution")}
										onResizeCard={size => handleResizeCard("geographicDistribution", size)}>
										<Box sx={{ width: "100%", height: 400 }}>
											<GeographicMap data={projectData} />
										</Box>
									</ChartContainer>
								</Grid>
							)}

							{/* Bottom row of smaller charts */}
							{visibleCharts.investmentReturns && (
								<Grid
									item
									xs={12}
									lg={getGridSpan(cardSizes.investmentReturns)}
									sx={{
										transform: "translateY(0)",
										transition: "transform 0.5s ease, opacity 0.5s ease",
										animation: "fadeIn 0.8s ease-out",
										animationDelay: "0.6s"
									}}>
									<ChartContainer
										title={t("charts.investmentReturns.title") || "Investment Returns"}
										description={t("charts.investmentReturns.description") || "IRR vs. yield on cost analysis"}
										icon={TrendingUp}
										onHide={() => handleHideChart("investmentReturns")}
										onResizeCard={size => handleResizeCard("investmentReturns", size)}>
										<Box sx={{ width: "100%", height: 300 }}>
											<InvestmentReturnsChart data={projectData} />
										</Box>
									</ChartContainer>
								</Grid>
							)}

							{visibleCharts.ebitdaMargin && (
								<Grid
									item
									xs={12}
									lg={getGridSpan(cardSizes.ebitdaMargin)}
									sx={{
										transform: "translateY(0)",
										transition: "transform 0.5s ease, opacity 0.5s ease",
										animation: "fadeIn 0.8s ease-out",
										animationDelay: "0.7s"
									}}>
									<ChartContainer
										title={t("charts.ebitdaMargin.title") || "EBITDA Margin"}
										description={t("charts.ebitdaMargin.description") || "Profitability analysis by project type"}
										icon={BarChart2}
										onHide={() => handleHideChart("ebitdaMargin")}
										onResizeCard={size => handleResizeCard("ebitdaMargin", size)}>
										<Box sx={{ width: "100%", height: 300 }}>
											<EbitdaMarginChart data={financialData} />
										</Box>
									</ChartContainer>
								</Grid>
							)}

							{visibleCharts.countryComparison && (
								<Grid
									item
									xs={12}
									lg={getGridSpan(cardSizes.countryComparison)}
									sx={{
										transform: "translateY(0)",
										transition: "transform 0.5s ease, opacity 0.5s ease",
										animation: "fadeIn 0.8s ease-out",
										animationDelay: "0.8s"
									}}>
									<ChartContainer
										title={t("charts.countryComparison.title") || "Country Comparison"}
										description={t("charts.countryComparison.description") || "Investment and capacity by country"}
										icon={BarChart2}
										onHide={() => handleHideChart("countryComparison")}
										onResizeCard={size => handleResizeCard("countryComparison", size)}>
										<Box sx={{ width: "100%", height: 300 }}>
											<CountryComparisonChart data={countryData} />
										</Box>
									</ChartContainer>
								</Grid>
							)}
						</Grid>
					</Box>
				</Grid>
			</Container>
		</Box>
	);
}

export default Dashboard;
