import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	TextField,
	IconButton,
	Divider,
	Typography,
	Alert,
	Stack,
	Tooltip,
	Checkbox,
	FormControlLabel
} from "@mui/material";
import { Save, Delete, Add, Edit, Dashboard, CloseFullscreen, OpenInFull, VisibilityOff } from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext";

export default function DashboardLayoutManager({ open, onClose, onSave, onLoad, currentLayout, availableCharts = [] }) {
	const { t } = useI18n();
	const [savedLayouts, setSavedLayouts] = useState([]);
	const [layoutName, setLayoutName] = useState("");
	const [activeTab, setActiveTab] = useState("saved");
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [selectedLayout, setSelectedLayout] = useState(null);
	const [activeChartSettings, setActiveChartSettings] = useState(availableCharts.map(chart => ({ id: chart.id, visible: true, size: chart.defaultSize || "md" })));

	// Load saved layouts from localStorage
	useEffect(() => {
		const saved = localStorage.getItem("dashboardLayouts");
		if (saved) {
			try {
				setSavedLayouts(JSON.parse(saved));
			} catch (e) {
				console.error("Error loading saved layouts", e);
			}
		}
	}, []);

	// Update chart settings when availableCharts changes
	useEffect(() => {
		if (availableCharts.length) {
			setActiveChartSettings(
				availableCharts.map(chart => ({
					id: chart.id,
					visible: true,
					size: chart.defaultSize || "md"
				}))
			);
		}
	}, [availableCharts]);

	// Save the current layout
	const handleSaveLayout = () => {
		if (!layoutName.trim()) {
			return;
		}

		const newLayout = {
			id: `layout-${Date.now()}`,
			name: layoutName.trim(),
			layout: currentLayout,
			chartSettings: activeChartSettings,
			created: new Date().toISOString()
		};

		const updated = [...savedLayouts, newLayout];
		setSavedLayouts(updated);
		localStorage.setItem("dashboardLayouts", JSON.stringify(updated));
		setLayoutName("");
		setShowSaveDialog(false);
	};

	// Load a saved layout
	const handleLoadLayout = layout => {
		setSelectedLayout(layout);
		if (onLoad) {
			onLoad(layout);
		}
	};

	// Delete a saved layout
	const handleDeleteLayout = layoutId => {
		const updated = savedLayouts.filter(l => l.id !== layoutId);
		setSavedLayouts(updated);
		localStorage.setItem("dashboardLayouts", JSON.stringify(updated));
		if (selectedLayout?.id === layoutId) {
			setSelectedLayout(null);
		}
	};

	// Toggle chart visibility
	const toggleChartVisibility = chartId => {
		setActiveChartSettings(settings => settings.map(s => (s.id === chartId ? { ...s, visible: !s.visible } : s)));
	};

	// Change chart size
	const setChartSize = (chartId, size) => {
		setActiveChartSettings(settings => settings.map(s => (s.id === chartId ? { ...s, size } : s)));
	};

	// Apply chart settings
	const applyChartSettings = () => {
		if (onSave) {
			onSave(activeChartSettings);
		}
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					height: { sm: "80vh", xs: "90vh" }
				}
			}}>
			<DialogTitle>{t("dashboard.layoutManager")}</DialogTitle>

			<Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
				<Stack direction="row" spacing={1}>
					<Button variant={activeTab === "saved" ? "contained" : "text"} onClick={() => setActiveTab("saved")} startIcon={<Dashboard />}>
						{t("dashboard.savedLayouts")}
					</Button>
					<Button variant={activeTab === "charts" ? "contained" : "text"} onClick={() => setActiveTab("charts")} startIcon={<OpenInFull />}>
						{t("dashboard.chartSettings")}
					</Button>
				</Stack>
			</Box>

			<DialogContent sx={{ p: 3 }}>
				{activeTab === "saved" && (
					<>
						<Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<Typography variant="h6">{t("dashboard.savedLayouts")}</Typography>
							<Button startIcon={<Save />} variant="outlined" size="small" onClick={() => setShowSaveDialog(true)}>
								{t("action.saveCurrentLayout")}
							</Button>
						</Box>

						{savedLayouts.length === 0 ? (
							<Alert severity="info" sx={{ mb: 2 }}>
								{t("dashboard.noSavedLayouts")}
							</Alert>
						) : (
							<List sx={{ maxHeight: "60vh", overflow: "auto" }}>
								{savedLayouts.map(layout => (
									<React.Fragment key={layout.id}>
										<ListItem button selected={selectedLayout?.id === layout.id} onClick={() => handleLoadLayout(layout)}>
											<ListItemText primary={layout.name} secondary={new Date(layout.created).toLocaleString()} />
											<ListItemSecondaryAction>
												<Tooltip title={t("action.delete")}>
													<IconButton edge="end" aria-label="delete" onClick={() => handleDeleteLayout(layout.id)}>
														<Delete />
													</IconButton>
												</Tooltip>
											</ListItemSecondaryAction>
										</ListItem>
										<Divider />
									</React.Fragment>
								))}
							</List>
						)}

						{/* Save new layout dialog */}
						<Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
							<DialogTitle>{t("dashboard.saveLayout")}</DialogTitle>
							<DialogContent>
								<TextField autoFocus margin="dense" label={t("dashboard.layoutName")} type="text" fullWidth value={layoutName} onChange={e => setLayoutName(e.target.value)} />
							</DialogContent>
							<DialogActions>
								<Button onClick={() => setShowSaveDialog(false)}>{t("action.cancel")}</Button>
								<Button onClick={handleSaveLayout} color="primary" disabled={!layoutName.trim()}>
									{t("action.save")}
								</Button>
							</DialogActions>
						</Dialog>
					</>
				)}

				{activeTab === "charts" && (
					<>
						<Typography variant="h6" sx={{ mb: 2 }}>
							{t("dashboard.chartVisibility")}
						</Typography>

						<List sx={{ maxHeight: "60vh", overflow: "auto" }}>
							{availableCharts.map((chart, index) => {
								const chartSetting = activeChartSettings.find(s => s.id === chart.id) || { visible: true, size: chart.defaultSize || "md" };

								return (
									<React.Fragment key={chart.id}>
										<ListItem>
											<FormControlLabel
												control={<Checkbox checked={chartSetting.visible} onChange={() => toggleChartVisibility(chart.id)} />}
												label={<ListItemText primary={t(`charts.${chart.id.replace(/-/g, "")}.title`)} secondary={t(`charts.${chart.id.replace(/-/g, "")}.description`)} />}
											/>
											<ListItemSecondaryAction>
												<Box sx={{ display: "flex", gap: 1 }}>
													<Button variant={chartSetting.size === "sm" ? "contained" : "outlined"} size="small" onClick={() => setChartSize(chart.id, "sm")}>
														S
													</Button>
													<Button variant={chartSetting.size === "md" ? "contained" : "outlined"} size="small" onClick={() => setChartSize(chart.id, "md")}>
														M
													</Button>
													<Button variant={chartSetting.size === "lg" ? "contained" : "outlined"} size="small" onClick={() => setChartSize(chart.id, "lg")}>
														L
													</Button>
												</Box>
											</ListItemSecondaryAction>
										</ListItem>
										<Divider />
									</React.Fragment>
								);
							})}
						</List>
					</>
				)}
			</DialogContent>

			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={onClose}>{t("action.cancel")}</Button>
				{activeTab === "charts" && (
					<Button variant="contained" color="primary" onClick={applyChartSettings}>
						{t("action.apply")}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
}
