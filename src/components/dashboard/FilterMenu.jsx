import { useRef, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Box, Paper, Typography, FormGroup, FormControlLabel, Checkbox, Button, Slider, Grid, Divider, ClickAwayListener, useTheme } from "@mui/material";
import { useI18n } from "../../context/I18nContext";

function FilterMenu({ onClose }) {
	const menuRef = useRef(null);
	const theme = useTheme();
	const { t } = useI18n();

	// Sample filter states
	const [projectTypes, setProjectTypes] = useState({
		"Solar Ground": true,
		"On-shore Wind": true,
		"Solar Rooftop": true,
		"Off-shore Wind": true
	});

	const [countries, setCountries] = useState({
		Romania: true,
		Bulgaria: true,
		Serbia: true,
		"N.Macedonia": true,
		Greece: true
	});

	const [capacityRange, setCapacityRange] = useState([0, 200]);

	// Handle capacity slider change
	const handleCapacityChange = (event, newValue) => {
		setCapacityRange(newValue);
	};

	const handleProjectTypeChange = type => {
		setProjectTypes(prev => ({
			...prev,
			[type]: !prev[type]
		}));
	};

	const handleCountryChange = country => {
		setCountries(prev => ({
			...prev,
			[country]: !prev[country]
		}));
	};

	const handleApplyFilters = () => {
		// In a real app, you would apply these filters to your data
		console.log("Applying filters:", { projectTypes, countries, capacityRange });
		onClose();
	};

	return (
		<ClickAwayListener onClickAway={onClose}>
			<Paper
				elevation={5}
				sx={{
					position: "absolute",
					right: 0,
					top: "100%",
					mt: 1,
					width: 300,
					maxWidth: "90vw",
					zIndex: 1000,
					borderRadius: 2,
					overflow: "hidden"
				}}>
				<Box sx={{ p: 3 }}>
					<Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
						{t("dashboard.filters.title") || "Filter Dashboard"}
					</Typography>

					<Divider sx={{ my: 2 }} />

					{/* Project Type Filter */}
					<Box sx={{ mb: 3 }}>
						<Typography variant="subtitle2" gutterBottom sx={{ color: "text.secondary", fontWeight: 500 }}>
							{t("dashboard.filters.projectType") || "Project Type"}
						</Typography>
						<FormGroup>
							{Object.entries(projectTypes).map(([type, isChecked]) => (
								<FormControlLabel
									key={type}
									control={<Checkbox checked={isChecked} onChange={() => handleProjectTypeChange(type)} size="small" color="primary" />}
									label={
										<Typography variant="body2" sx={{ color: "text.secondary" }}>
											{type}
										</Typography>
									}
								/>
							))}
						</FormGroup>
					</Box>

					{/* Country Filter */}
					<Box sx={{ mb: 3 }}>
						<Typography variant="subtitle2" gutterBottom sx={{ color: "text.secondary", fontWeight: 500 }}>
							{t("dashboard.filters.country") || "Country"}
						</Typography>
						<Grid container spacing={1}>
							{Object.entries(countries).map(([country, isChecked]) => (
								<Grid item xs={6} key={country}>
									<FormControlLabel
										control={<Checkbox checked={isChecked} onChange={() => handleCountryChange(country)} size="small" color="primary" />}
										label={
											<Typography variant="body2" sx={{ color: "text.secondary" }}>
												{country}
											</Typography>
										}
									/>
								</Grid>
							))}
						</Grid>
					</Box>

					{/* Capacity Range Filter */}
					<Box sx={{ mb: 4 }}>
						<Typography variant="subtitle2" gutterBottom sx={{ color: "text.secondary", fontWeight: 500 }}>
							{t("dashboard.filters.capacityRange") || "Capacity Range"}: {capacityRange[0]} - {capacityRange[1]} MW
						</Typography>
						<Slider
							value={capacityRange}
							onChange={handleCapacityChange}
							valueLabelDisplay="auto"
							min={0}
							max={200}
							sx={{
								color: theme.palette.primary.main,
								"& .MuiSlider-thumb": {
									"&:hover, &.Mui-focusVisible": {
										boxShadow: `0px 0px 0px 8px ${theme.palette.mode === "dark" ? "rgba(90, 105, 255, 0.16)" : "rgba(90, 105, 255, 0.16)"}`
									}
								}
							}}
						/>
					</Box>

					<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
						<Button variant="text" onClick={onClose} size="small" sx={{ textTransform: "none" }}>
							{t("common.cancel") || "Cancel"}
						</Button>
						<Button variant="contained" onClick={handleApplyFilters} size="small" sx={{ textTransform: "none" }}>
							{t("dashboard.filters.apply") || "Apply Filters"}
						</Button>
					</Box>
				</Box>
			</Paper>
		</ClickAwayListener>
	);
}

export default FilterMenu;
