import { Info, MoreHorizontal, Maximize2, Download, FileText, EyeOff, Layout, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import {
	Card,
	CardContent,
	CardHeader,
	Typography,
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Dialog,
	DialogTitle,
	DialogContent,
	Box,
	Paper,
	Divider,
	useTheme,
	alpha
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

function ChartContainer({ title, description, children, height = "sm", icon: Icon, onHide, onResizeCard }) {
	const theme = useTheme();

	// Add state for menu visibility
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);
	const [sizeMenuAnchorEl, setSizeMenuAnchorEl] = useState(null);
	const [maximized, setMaximized] = useState(false);
	const chartRef = useRef(null);

	const menuOpen = Boolean(menuAnchorEl);
	const sizeMenuOpen = Boolean(sizeMenuAnchorEl);

	// Handle ESC key to close maximized view
	useEffect(() => {
		function handleEscKey(event) {
			if (event.key === "Escape" && maximized) {
				setMaximized(false);
			}
		}

		if (maximized) {
			document.addEventListener("keydown", handleEscKey);
		}

		return () => {
			document.removeEventListener("keydown", handleEscKey);
		};
	}, [maximized]);

	// Function to download chart as image
	const downloadAsImage = async () => {
		if (!chartRef.current) return;

		try {
			const canvas = await html2canvas(chartRef.current);
			const image = canvas.toDataURL("image/png");
			const link = document.createElement("a");
			link.href = image;
			link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-chart.png`;
			link.click();
		} catch (error) {
			console.error("Error exporting chart as image:", error);
			alert("Failed to download image. Please try again.");
		}
	};

	// Function to export chart data
	const exportData = () => {
		// Since we don't have direct access to the chart data here,
		// we'll dispatch a custom event that the parent can listen for
		const exportEvent = new CustomEvent("exportChartData", {
			detail: { chartTitle: title },
			bubbles: true
		});
		chartRef.current.dispatchEvent(exportEvent);
	};

	// Function to handle card size change
	const handleSizeChange = size => {
		if (typeof onResizeCard === "function") {
			onResizeCard(size);
		}
		setSizeMenuAnchorEl(null);
		setMenuAnchorEl(null);
	};

	// Function to handle maximize action
	const handleMaximize = () => {
		setMaximized(true);
		setSizeMenuAnchorEl(null);
		setMenuAnchorEl(null);
	};

	// Menu handlers
	const handleMenuOpen = event => {
		setMenuAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
	};

	const handleSizeMenuOpen = event => {
		setSizeMenuAnchorEl(event.currentTarget);
		// Don't close the main menu when opening the size menu
		event.stopPropagation();
	};

	const handleSizeMenuClose = () => {
		setSizeMenuAnchorEl(null);
	};

	const handleHide = () => {
		if (typeof onHide === "function") {
			onHide();
		}
		handleMenuClose();
	};

	return (
		<>
			{/* Dialog for maximized view */}
			<Dialog
				fullWidth
				maxWidth="xl"
				open={maximized}
				onClose={() => setMaximized(false)}
				PaperProps={{
					sx: {
						height: "90vh",
						maxHeight: "90vh",
						bgcolor: theme.palette.background.paper,
						borderRadius: 3
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
						{Icon && (
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
								<Icon size={24} />
							</Box>
						)}
						<Typography variant="h5" component="h2">
							{title}
						</Typography>
					</Box>
					<IconButton onClick={() => setMaximized(false)} aria-label="Close maximized view">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent sx={{ padding: 3 }}>
					<Box
						sx={{
							width: "100%",
							height: "calc(100% - 20px)",
							position: "relative",
							borderRadius: 2,
							overflow: "hidden"
						}}>
						<Box ref={chartRef} sx={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }}>
							{children}
						</Box>
					</Box>
				</DialogContent>
			</Dialog>

			{/* Chart Card */}
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
							{Icon && (
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
									<Icon size={20} />
								</Box>
							)}
							<Box>
								<Typography variant="h6" component="h3" fontWeight={600}>
									{title}
								</Typography>
								{description && (
									<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, opacity: 0.8 }}>
										{description}
									</Typography>
								)}
								<Box
									sx={{
										width: "3rem",
										height: "0.25rem",
										mt: 1,
										borderRadius: "4px",
										background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
										opacity: 0.8
									}}
								/>
							</Box>
						</Box>
					}
					action={
						<Box sx={{ display: "flex" }}>
							<IconButton
								aria-label="Chart information"
								size="small"
								sx={{
									color: theme.palette.text.secondary,
									transition: "all 0.2s ease",
									"&:hover": {
										color: theme.palette.primary.main,
										bgcolor: alpha(theme.palette.primary.main, 0.08)
									}
								}}>
								<InfoIcon fontSize="small" />
							</IconButton>
							<IconButton
								onClick={handleMenuOpen}
								aria-label="More options"
								aria-controls={menuOpen ? "chart-menu" : undefined}
								aria-expanded={menuOpen ? "true" : undefined}
								aria-haspopup="true"
								size="small"
								sx={{
									color: theme.palette.text.secondary,
									transition: "all 0.2s ease",
									"&:hover": {
										color: theme.palette.primary.main,
										bgcolor: alpha(theme.palette.primary.main, 0.08)
									}
								}}>
								<MoreHorizIcon fontSize="small" />
							</IconButton>
						</Box>
					}
					sx={{
						p: 2.5,
						pb: 1.5,
						"& .MuiCardHeader-action": {
							margin: 0,
							alignSelf: "center"
						}
					}}
				/>
				<CardContent
					sx={{
						flexGrow: 1,
						p: 2.5,
						pt: 0,
						"&:last-child": {
							pb: 2.5
						}
					}}>
					<Box
						ref={chartRef}
						sx={{
							width: "100%",
							height: "100%",
							position: "relative",
							zIndex: 1,
							animation: "fadeIn 0.5s ease-out"
						}}>
						{children}
					</Box>
				</CardContent>

				{/* Menu for chart options */}
				<Menu
					id="chart-menu"
					anchorEl={menuAnchorEl}
					open={menuOpen}
					onClose={handleMenuClose}
					MenuListProps={{
						"aria-labelledby": "chart-options-button",
						dense: true
					}}
					PaperProps={{
						elevation: 3,
						sx: {
							minWidth: 180,
							borderRadius: 2,
							mt: 0.5,
							boxShadow: theme.shadows[4],
							"& .MuiMenuItem-root": {
								py: 1,
								"&:hover": {
									bgcolor: alpha(theme.palette.primary.main, 0.08)
								}
							}
						}
					}}
					transformOrigin={{ horizontal: "right", vertical: "top" }}
					anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
					<MenuItem onClick={handleSizeMenuOpen}>
						<ListItemIcon>
							<ViewColumnIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Card Size</ListItemText>
						<ExpandMoreIcon fontSize="small" />
					</MenuItem>

					<MenuItem
						onClick={() => {
							downloadAsImage();
							handleMenuClose();
						}}>
						<ListItemIcon>
							<DownloadIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Download as Image</ListItemText>
					</MenuItem>

					<MenuItem
						onClick={() => {
							exportData();
							handleMenuClose();
						}}>
						<ListItemIcon>
							<TextSnippetIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Export Data</ListItemText>
					</MenuItem>

					<MenuItem
						onClick={() => {
							handleMaximize();
							handleMenuClose();
						}}>
						<ListItemIcon>
							<AspectRatioIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Maximize</ListItemText>
					</MenuItem>

					<Divider />

					<MenuItem onClick={handleHide}>
						<ListItemIcon>
							<VisibilityOffIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Hide Chart</ListItemText>
					</MenuItem>
				</Menu>

				{/* Size Menu */}
				<Menu
					id="size-menu"
					anchorEl={sizeMenuAnchorEl}
					open={sizeMenuOpen}
					onClose={handleSizeMenuClose}
					MenuListProps={{
						"aria-labelledby": "chart-size-button",
						dense: true
					}}
					PaperProps={{
						elevation: 3,
						sx: {
							minWidth: 120,
							borderRadius: 2,
							mt: 0.5,
							boxShadow: theme.shadows[4],
							"& .MuiMenuItem-root": {
								py: 1,
								"&:hover": {
									bgcolor: alpha(theme.palette.primary.main, 0.08)
								}
							}
						}
					}}
					transformOrigin={{ horizontal: "right", vertical: "top" }}
					anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
					<MenuItem onClick={() => handleSizeChange("1/3")}>
						<ListItemIcon>
							<Box
								component="span"
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: "0.75rem",
									fontWeight: "medium",
									bgcolor: alpha(theme.palette.primary.light, 0.2),
									borderRadius: 0.5,
									px: 1,
									py: 0.25
								}}>
								1/3
							</Box>
						</ListItemIcon>
						<ListItemText>33% Width</ListItemText>
					</MenuItem>

					<MenuItem onClick={() => handleSizeChange("1/2")}>
						<ListItemIcon>
							<Box
								component="span"
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: "0.75rem",
									fontWeight: "medium",
									bgcolor: alpha(theme.palette.primary.light, 0.2),
									borderRadius: 0.5,
									px: 1,
									py: 0.25
								}}>
								1/2
							</Box>
						</ListItemIcon>
						<ListItemText>50% Width</ListItemText>
					</MenuItem>

					<MenuItem onClick={() => handleSizeChange("full")}>
						<ListItemIcon>
							<Box
								component="span"
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: "0.75rem",
									fontWeight: "medium",
									bgcolor: alpha(theme.palette.primary.light, 0.2),
									borderRadius: 0.5,
									px: 1,
									py: 0.25
								}}>
								1/1
							</Box>
						</ListItemIcon>
						<ListItemText>Full Width</ListItemText>
					</MenuItem>
				</Menu>
			</Card>
		</>
	);
}

export default ChartContainer;
