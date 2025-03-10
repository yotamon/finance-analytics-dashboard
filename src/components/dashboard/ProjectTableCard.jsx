import React, { useState, useRef, useMemo } from "react";
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Box,
	Card,
	CardHeader,
	CardContent,
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	useTheme,
	alpha,
	Dialog,
	DialogTitle,
	DialogContent,
	Tooltip,
	Divider,
	FormControl,
	InputLabel,
	Select,
	Button
} from "@mui/material";
import { Wind, Sun, Database, Download, Maximize2, MoreHorizontal, FileText, TrendingUp, BarChart2, RefreshCw } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { useI18n } from "../../context/I18nContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import RefreshIcon from "@mui/icons-material/Refresh";

/**
 * ProjectTableCard - Displays project data in a table as a dashboard card
 *
 * @param {Object} props
 * @param {Array} props.projects - Array of project objects to display
 * @param {JSX.Element} props.pagination - Optional pagination component
 * @param {Function} props.onHide - Function to call when hiding the card
 * @param {Function} props.onResizeCard - Function to call when resizing the card
 * @param {Object} props.filterParams - Current filter parameters
 * @param {Function} props.handleFilter - Function to handle filter changes
 * @param {Function} props.resetFilters - Function to reset all filters
 * @param {boolean} props.embedded - When true, renders just the content without the card wrapper
 * @returns {JSX.Element}
 */
function ProjectTableCard({ projects = [], pagination, onHide, onResizeCard, filterParams = {}, handleFilter = () => {}, resetFilters = () => {}, embedded = false }) {
	const theme = useTheme();
	const { convert, currency } = useCurrency();
	const { t } = useI18n();
	const tableRef = useRef(null);

	// Add states for menu and dialog
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);
	const [maximized, setMaximized] = useState(false);

	const menuOpen = Boolean(menuAnchorEl);

	// Handle menu open/close
	const handleMenuOpen = event => {
		setMenuAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
	};

	// Function to handle maximize action
	const handleMaximize = () => {
		setMaximized(true);
		setMenuAnchorEl(null);
	};

	// Function to handle hide action
	const handleHide = () => {
		if (typeof onHide === "function") {
			onHide();
		}
		handleMenuClose();
	};

	// Function to export data as CSV
	const exportData = () => {
		if (!projects || projects.length === 0) return;

		try {
			const headers = ["Name", "Type", "Country", "Status", "Capacity", "Investment", "IRR"];
			const csvContent = [
				headers.join(","),
				...projects.map(project => [project.name, project.type, project.country, project.status, project.capacity, project.investmentCost, (project.irr * 100).toFixed(1) + "%"].join(","))
			].join("\n");

			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);

			link.setAttribute("href", url);
			link.setAttribute("download", "project-portfolio.csv");
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			handleMenuClose();
		} catch (error) {
			/* eslint-disable-next-line no-console */
console.error("Error exporting data:", error);
		}
	};

	// Helper function to get unique values from an array of objects by property
	const getUniqueValues = (data, property) => {
		return [...new Set(data.map(item => item[property]))].sort();
	};

	// Get unique types and countries
	const uniqueTypes = getUniqueValues(projects, "type");
	const uniqueCountries = getUniqueValues(projects, "country");

	// Custom filter handler to update parent's filters
	const handleFilterChange = (field, value) => {
		// If value is empty string, set to null to remove filter
		const newValue = value === "" ? null : value;

		// Create new filter object with updated field
		const newFilters = {
			...filterParams,
			[field]: newValue
		};

		// Remove null/undefined values from filters
		Object.keys(newFilters).forEach(key => {
			if (newFilters[key] === null || newFilters[key] === undefined) {
				delete newFilters[key];
			}
		});

		// Call parent's handleFilter function
		handleFilter(newFilters);
	};

	// Function to render filter components
	const renderFilters = () => (
		<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1 }}>
			<FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
				<InputLabel id="type-filter-label">{t("filter.type")}</InputLabel>
				<Select labelId="type-filter-label" value={filterParams.type || ""} onChange={e => handleFilterChange("type", e.target.value)} label={t("filter.type")} displayEmpty>
					<MenuItem value="">{t("filter.all")}</MenuItem>
					{uniqueTypes.map(type => (
						<MenuItem key={type} value={type}>
							{type}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
				<InputLabel id="country-filter-label">{t("filter.country")}</InputLabel>
				<Select labelId="country-filter-label" value={filterParams.country || ""} onChange={e => handleFilterChange("country", e.target.value)} label={t("filter.country")} displayEmpty>
					<MenuItem value="">{t("filter.all")}</MenuItem>
					{uniqueCountries.map(country => (
						<MenuItem key={country} value={country}>
							{country}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</Box>
	);

	// Define function to render the table
	const renderTable = () => (
		<Table stickyHeader size="medium">
			<TableHead>
				<TableRow>
					{columns.map(column => (
						<TableCell
							key={column.id}
							align={column.align}
							sx={{
								fontWeight: 600,
								backgroundColor: alpha(theme.palette.background.paper, 0.98),
								color: theme.palette.text.primary,
								py: 1.5
							}}>
							{column.label}
						</TableCell>
					))}
				</TableRow>
			</TableHead>
			<TableBody>
				{projects.map(project => (
					<TableRow
						key={project.name}
						hover
						sx={{
							"&:last-child td, &:last-child th": { border: 0 },
							transition: "background-color 0.2s ease",
							"&:hover": {
								backgroundColor: alpha(theme.palette.primary.main, 0.04)
							}
						}}>
						<TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
							{project.name}
						</TableCell>
						<TableCell>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								{getProjectTypeIcon(project.type)}
								<Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
									{project.type}
								</Typography>
							</Box>
						</TableCell>
						<TableCell>{project.country}</TableCell>
						<TableCell>
							<Box
								component="span"
								sx={{
									display: "inline-block",
									py: 0.5,
									px: 1.5,
									borderRadius: 1,
									fontWeight: 600,
									fontSize: "0.75rem",
									backgroundColor: getStatusColor(project.status).bg,
									color: getStatusColor(project.status).color,
									minWidth: 85,
									textAlign: "center"
								}}>
								{project.status}
							</Box>
						</TableCell>
						<TableCell align="right" sx={{ fontWeight: 500 }}>
							{project.capacity}
						</TableCell>
						<TableCell align="right" sx={{ fontWeight: 500 }}>
							{currency.symbol}
							{convert(project.investmentCost)}M
						</TableCell>
						<TableCell align="right" sx={{ fontWeight: 500, color: theme.palette.success.main }}>
							{formatPercentage(project.irr)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);

	// Handle empty projects array
	if (!projects || projects.length === 0) {
		return (
			<Card
				elevation={2}
				sx={{
					borderRadius: 3,
					height: "100%",
					display: "flex",
					flexDirection: "column",
					position: "relative",
					overflow: "hidden",
					"&::after": {
						content: '""',
						position: "absolute",
						top: 0,
						right: 0,
						width: "100%",
						height: "5px",
						background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
						opacity: 0.7
					}
				}}>
				<CardHeader
					title={
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Box
								sx={{
									mr: 1.5,
									color: theme.palette.primary.main,
									bgcolor: alpha(theme.palette.primary.light, 0.2),
									p: 1,
									borderRadius: 2,
									display: "flex"
								}}>
								<Database size={20} />
							</Box>
							<Typography variant="h6" component="h3" fontWeight={600}>
								Project Portfolio
							</Typography>
						</Box>
					}
					action={
						<IconButton aria-label="menu" onClick={handleMenuOpen}>
							<MoreHorizIcon />
						</IconButton>
					}
				/>
				<CardContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, py: 6 }}>
					<Box sx={{ textAlign: "center" }}>
						<Typography variant="h6" color="text.secondary" gutterBottom>
							No Project Data
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Try different filters or upload project data
						</Typography>
					</Box>
				</CardContent>
			</Card>
		);
	}

	// Project type icon mapping
	const getProjectTypeIcon = type => {
		switch (type) {
			case "On-shore Wind":
				return <Wind size={18} color={theme.palette.primary.main} />;
			case "Solar Ground":
				return <Sun size={18} color={theme.palette.warning.main} />;
			default:
				return <TrendingUp size={18} color={theme.palette.info.main} />;
		}
	};

	// Status chip color mapping
	const getStatusColor = status => {
		switch (status) {
			case "Planning":
				return {
					bg: alpha(theme.palette.primary.main, 0.1),
					color: theme.palette.primary.main
				};
			case "Construction":
				return {
					bg: alpha(theme.palette.warning.main, 0.1),
					color: theme.palette.warning.main
				};
			case "Operational":
				return {
					bg: alpha(theme.palette.success.main, 0.1),
					color: theme.palette.success.main
				};
			default:
				return {
					bg: alpha(theme.palette.grey[500], 0.1),
					color: theme.palette.grey[500]
				};
		}
	};

	// Format percentage values
	const formatPercentage = value => {
		if (typeof value !== "number") return "-";
		return `${(value * 100).toFixed(1)}%`;
	};

	// Table column definitions
	const columns = [
		{
			id: "name",
			label: "Name",
			align: "left"
		},
		{
			id: "type",
			label: "Type",
			align: "left"
		},
		{
			id: "country",
			label: "Country",
			align: "left"
		},
		{
			id: "status",
			label: "Status",
			align: "left"
		},
		{
			id: "capacity",
			label: "Capacity (MW)",
			align: "right"
		},
		{
			id: "investment",
			label: "Investment",
			align: "right"
		},
		{
			id: "irr",
			label: "IRR",
			align: "right"
		}
	];

	return (
		<>
			{maximized ? (
				<Dialog
					fullScreen
					open={maximized}
					onClose={() => setMaximized(false)}
					PaperProps={{
						sx: {
							bgcolor: theme.palette.background.default
						}
					}}>
					<DialogTitle
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							padding: 2
						}}>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Box
								sx={{
									mr: 2,
									color: theme.palette.primary.main,
									bgcolor: alpha(theme.palette.primary.light, 0.2),
									p: 1.5,
									borderRadius: 2,
									display: "flex",
									alignItems: "center",
									justifyContent: "center"
								}}>
								<Database size={24} />
							</Box>
							<Typography variant="h5" component="h2">
								Project Portfolio
							</Typography>
						</Box>
						<IconButton onClick={() => setMaximized(false)} aria-label="Close maximized view">
							<CloseIcon />
						</IconButton>
					</DialogTitle>
					<DialogContent sx={{ padding: 3 }}>
						{renderFilters()}
						<TableContainer sx={{ height: "calc(100% - 60px)", mt: 2, borderRadius: 2, overflow: "auto" }}>{renderTable()}</TableContainer>
					</DialogContent>
				</Dialog>
			) : null}

			{/* Menu */}
			<Menu anchorEl={menuAnchorEl} open={menuOpen} onClose={handleMenuClose} transformOrigin={{ horizontal: "right", vertical: "top" }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
				<MenuItem onClick={handleMaximize}>
					<ListItemIcon>
						<AspectRatioIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Maximize</ListItemText>
				</MenuItem>
				<MenuItem onClick={exportData}>
					<ListItemIcon>
						<DownloadIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Export CSV</ListItemText>
				</MenuItem>
				<Divider />
				<MenuItem onClick={handleHide}>
					<ListItemIcon sx={{ color: theme.palette.error.main }}>
						<CloseIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText sx={{ color: theme.palette.error.main }}>Hide Card</ListItemText>
				</MenuItem>
			</Menu>

			{embedded ? (
				// Embedded content - just the table without card wrapper
				<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
					{renderFilters()}
					<TableContainer
						ref={tableRef}
						sx={{
							flexGrow: 1,
							maxHeight: { xs: 300, md: 350, lg: 400 },
							overflowY: "auto",
							mt: 2
						}}>
						{renderTable()}
					</TableContainer>
					{pagination}
				</Box>
			) : (
				// Full card with table
				<Card
					elevation={2}
					sx={{
						borderRadius: 3,
						transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
						"&:hover": {
							boxShadow: theme.shadows[10],
							transform: "translateY(-4px)"
						},
						height: "100%",
						display: "flex",
						flexDirection: "column",
						position: "relative",
						overflow: "hidden",
						"&::after": {
							content: '""',
							position: "absolute",
							top: 0,
							right: 0,
							width: "100%",
							height: "5px",
							background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
							opacity: 0.7
						}
					}}>
					<CardHeader
						title={
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box
									sx={{
										mr: 1.5,
										color: theme.palette.primary.main,
										bgcolor: alpha(theme.palette.primary.light, 0.2),
										p: 1,
										borderRadius: 2,
										display: "flex",
										transition: "all 0.2s ease",
										"&:hover": {
											transform: "scale(1.05)",
											bgcolor: alpha(theme.palette.primary.light, 0.3)
										}
									}}>
									<Database size={20} />
								</Box>
								<Typography variant="h6" component="h3" fontWeight={600}>
									Project Portfolio
								</Typography>
							</Box>
						}
						action={
							<Box sx={{ display: "flex" }}>
								<Tooltip title="Maximize">
									<IconButton aria-label="maximize" onClick={handleMaximize} size="small" sx={{ mr: 0.5 }}>
										<AspectRatioIcon fontSize="small" />
									</IconButton>
								</Tooltip>
								<Tooltip title="More options">
									<IconButton aria-label="menu" onClick={handleMenuOpen} size="small">
										<MoreHorizIcon fontSize="small" />
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
					<CardContent
						sx={{
							flexGrow: 1,
							p: 0,
							pt: 1,
							px: 2,
							"&:last-child": { pb: 0 },
							display: "flex",
							flexDirection: "column"
						}}>
						{renderFilters()}

						<TableContainer
							ref={tableRef}
							sx={{
								flexGrow: 1,
								maxHeight: { xs: 300, md: 350, lg: 400 },
								mt: 1
							}}>
							{renderTable()}
						</TableContainer>

						{/* Pagination */}
						{pagination && (
							<Box
								sx={{
									p: 1,
									borderTop: `1px solid ${theme.palette.divider}`,
									backgroundColor: alpha(theme.palette.background.paper, 0.98)
								}}>
								{pagination}
							</Box>
						)}
					</CardContent>
				</Card>
			)}
		</>
	);
}

export default ProjectTableCard;
