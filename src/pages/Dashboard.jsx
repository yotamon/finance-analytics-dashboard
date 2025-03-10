import { useState, useEffect, useMemo } from "react";
import { Download, Filter, Info, ChevronDown, BarChart2, PieChart, MapPin, TrendingUp, LayoutDashboard, RefreshCw } from "lucide-react";
import { useData } from "../context/DataContext";
import Container from "../components/layout/Container";
import KpiContainer from "../components/dashboard/KpiContainer";
import MobileDashboard from "../components/dashboard/MobileDashboard";
import DraggableDashboard from "../components/dashboard/DraggableDashboard";
import DashboardLayoutManager from "../components/dashboard/DashboardLayoutManager";
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
import {
	Box,
	Button,
	Typography,
	Grid,
	Paper,
	IconButton,
	Chip,
	useTheme as useMuiTheme,
	alpha,
	TablePagination,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	useMediaQuery,
	CircularProgress
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";

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

// Define available charts for the dashboard
const AVAILABLE_CHARTS = [
	{
		id: "revenue-ebitda",
		name: "Revenue & EBITDA Projection",
		description: "Track revenue and EBITDA projections over time",
		defaultSize: "lg"
	},
	{
		id: "project-portfolio",
		name: "Project Portfolio Overview",
		description: "Overview of all projects in the portfolio",
		defaultSize: "md"
	},
	{
		id: "project-type",
		name: "Project Type Breakdown",
		description: "Distribution of projects by type",
		defaultSize: "md"
	},
	{
		id: "geographic-map",
		name: "Geographic Distribution",
		description: "Map showing project locations",
		defaultSize: "lg"
	},
	{
		id: "cash-flow-sankey",
		name: "Cash Flow Sankey",
		description: "Visualize cash flow between different financial categories",
		defaultSize: "lg"
	},
	{
		id: "investment-returns",
		name: "Investment Returns",
		description: "Compare investment returns across projects",
		defaultSize: "sm"
	},
	{
		id: "ebitda-margin",
		name: "EBITDA Margin Progression",
		description: "Track EBITDA margin over time",
		defaultSize: "sm"
	},
	{
		id: "country-comparison",
		name: "Country Comparison",
		description: "Compare metrics by country",
		defaultSize: "sm"
	},
	{
		id: "metrics-heatmap",
		name: "Metrics Heat Map",
		description: "Compare metrics across project types and countries",
		defaultSize: "md"
	},
	{
		id: "correlation-matrix",
		name: "Correlation Matrix",
		description: "Visualize relationships between different metrics",
		defaultSize: "md"
	},
	{
		id: "project-table",
		name: "Project Table",
		description: "Detailed project data in tabular format",
		defaultSize: "lg"
	}
];

function Dashboard() {
	const { data, isLoading, loadingState, loadingProgress } = useData();
	const [showExportMenu, setShowExportMenu] = useState(false);
	const [showFilterMenu, setShowFilterMenu] = useState(false);
	const { t } = useI18n();
	const { isDark } = useTheme();
	const muiTheme = useMuiTheme();

	// Add media query for mobile detection
	const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

	// New state variables for customizable dashboard
	const [dashboardEditMode, setDashboardEditMode] = useState(false);
	const [showLayoutManager, setShowLayoutManager] = useState(false);
	const [currentLayouts, setCurrentLayouts] = useState(null);
	const [chartSettings, setChartSettings] = useState([]);

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

	// Handle layout change from DraggableDashboard
	const handleLayoutChange = newLayouts => {
		setCurrentLayouts(newLayouts);
		// Save to localStorage
		localStorage.setItem("dashboardCurrentLayout", JSON.stringify(newLayouts));
	};

	// Handle load layout from manager
	const handleLoadLayout = layout => {
		setCurrentLayouts(layout.layout);
		setChartSettings(layout.chartSettings || []);
		setShowLayoutManager(false);
	};

	// Handle save layout settings
	const handleSaveChartSettings = settings => {
		setChartSettings(settings);
	};

	// Toggle dashboard edit mode
	const toggleEditMode = () => {
		setDashboardEditMode(!dashboardEditMode);
	};

	// Render pagination controls for project table
	const renderTablePagination = () => (
		<TablePagination
			component="div"
			count={totalProjects}
			page={page}
			onPageChange={handleChangePage}
			rowsPerPage={rowsPerPage}
			onRowsPerPageChange={handleChangeRowsPerPage}
			rowsPerPageOptions={[5, 10, 25, 50]}
			labelRowsPerPage={t("table.rowsPerPage")}
			labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t("table.of")} ${count}`}
		/>
	);

	// Loading state
	if (isLoading) {
		return (
			<Container>
				<Box sx={{ py: 4, textAlign: "center", height: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
					<CircularProgress size={60} thickness={4} />
					<Typography variant="h6" sx={{ mt: 2 }}>
						{t("loading.processingData")}
					</Typography>
					<Box sx={{ width: "100%", maxWidth: "400px", mt: 2 }}>
						<LoadingProgressBar loadingState={loadingState} progress={loadingProgress} autoHide={false} />
					</Box>
				</Box>
			</Container>
		);
	}

	// Render different layouts based on screen size
	if (isMobile) {
		return (
			<Container>
				<Box sx={{ pb: 2 }}>
					<Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
						{t("dashboard.title")}
					</Typography>

					<MobileDashboard financialData={financialData} projectData={projectData} countryData={countryData} onFilter={() => setShowFilterMenu(true)} onSettings={() => setShowLayoutManager(true)} />

					{/* Filter Menu Dialog */}
					<FilterMenu open={showFilterMenu} onClose={() => setShowFilterMenu(false)} onFilter={handleFilter} filterParams={filterParams} onReset={resetFilters} />

					{/* Layout Manager Dialog */}
					{showLayoutManager && (
						<DashboardLayoutManager
							open={showLayoutManager}
							onClose={() => setShowLayoutManager(false)}
							onSave={handleSaveChartSettings}
							onLoad={handleLoadLayout}
							currentLayout={currentLayouts}
							availableCharts={AVAILABLE_CHARTS}
						/>
					)}
				</Box>
			</Container>
		);
	}

	return (
		<Container>
			{/* Dashboard Header */}
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap" }}>
				<Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
					{t("dashboard.title")}
				</Typography>

				<Box sx={{ display: "flex", gap: 1 }}>
					{/* Edit Mode Button */}
					<Button variant={dashboardEditMode ? "contained" : "outlined"} startIcon={<EditIcon />} onClick={toggleEditMode} color={dashboardEditMode ? "primary" : "inherit"} sx={{ mr: 1 }}>
						{dashboardEditMode ? t("action.exitEditMode") : t("action.editDashboard")}
					</Button>

					{/* Layout Manager Button */}
					<Button variant="outlined" startIcon={<DashboardCustomizeIcon />} onClick={() => setShowLayoutManager(true)} sx={{ mr: 1 }}>
						{t("action.layoutManager")}
					</Button>

					{/* Filter Button */}
					<Button variant="outlined" startIcon={<FilterAltIcon />} onClick={() => setShowFilterMenu(true)} sx={{ mr: 1 }}>
						{t("action.filter")}
					</Button>

					{/* Export Button */}
					<Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => setShowExportMenu(true)}>
						{t("action.export")}
					</Button>
				</Box>
			</Box>

			{/* KPI Section */}
			<KpiContainer projectData={projectData} sx={{ mb: 3 }} />

			{/* Main Dashboard Content */}
			<Box sx={{ mb: 4, width: "100%" }}>
				<DraggableDashboard
					financialData={financialData}
					projectData={projectData}
					countryData={countryData}
					editMode={dashboardEditMode}
					onLayoutChange={handleLayoutChange}
					savedLayouts={currentLayouts}
				/>
			</Box>

			{/* Dialogs */}
			{showLayoutManager && (
				<DashboardLayoutManager
					open={showLayoutManager}
					onClose={() => setShowLayoutManager(false)}
					onSave={handleSaveChartSettings}
					onLoad={handleLoadLayout}
					currentLayout={currentLayouts}
					availableCharts={AVAILABLE_CHARTS}
				/>
			)}

			{/* Export Menu Dialog */}
			<ExportMenu open={showExportMenu} onClose={() => setShowExportMenu(false)} data={data} />

			{/* Filter Menu Dialog */}
			<FilterMenu open={showFilterMenu} onClose={() => setShowFilterMenu(false)} onFilter={handleFilter} filterParams={filterParams} onReset={resetFilters} />
		</Container>
	);
}

export default Dashboard;
