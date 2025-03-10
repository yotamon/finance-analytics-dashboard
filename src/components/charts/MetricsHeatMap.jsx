import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, useTheme, CircularProgress, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { motion } from "framer-motion";
import { useI18n } from "../../context/I18nContext";
import { useCurrency } from "../../context/CurrencyContext";

/**
 * Metrics Heat Map Component
 *
 * This component creates a heat map for comparing financial metrics across projects or categories.
 * It visualizes data intensity using color gradients, allowing for quick comparison of multiple metrics.
 */
export const MetricsHeatMap = ({ data }) => {
	const theme = useTheme();
	const { t } = useI18n();
	const { convert, currency } = useCurrency();
	const [selectedMetric, setSelectedMetric] = useState("irr");
	const [hoveredCell, setHoveredCell] = useState(null);
	const [loading, setLoading] = useState(false);

	// Sample data if none provided
	const sampleData = {
		projects: [
			{ name: "Project A", type: "Solar Ground", country: "Romania", irr: 0.281, yieldOnCost: 0.15, ebitdaMargin: 0.85, debtServiceCoverage: 1.8 },
			{ name: "Project B", type: "On-shore Wind", country: "Romania", irr: 0.318, yieldOnCost: 0.14, ebitdaMargin: 0.92, debtServiceCoverage: 2.1 },
			{ name: "Project C", type: "Solar Ground", country: "N.Macedonia", irr: 0.282, yieldOnCost: 0.13, ebitdaMargin: 0.87, debtServiceCoverage: 1.9 },
			{ name: "Project D", type: "Solar Ground", country: "Bulgaria", irr: 0.268, yieldOnCost: 0.13, ebitdaMargin: 0.83, debtServiceCoverage: 1.7 },
			{ name: "Project E", type: "On-shore Wind", country: "Serbia", irr: 0.264, yieldOnCost: 0.13, ebitdaMargin: 0.82, debtServiceCoverage: 1.6 },
			{ name: "Project F", type: "Solar Ground", country: "Greece", irr: 0.293, yieldOnCost: 0.14, ebitdaMargin: 0.88, debtServiceCoverage: 2.0 },
			{ name: "Project G", type: "On-shore Wind", country: "Bulgaria", irr: 0.273, yieldOnCost: 0.12, ebitdaMargin: 0.84, debtServiceCoverage: 1.8 },
			{ name: "Project H", type: "Solar Ground", country: "Serbia", irr: 0.295, yieldOnCost: 0.15, ebitdaMargin: 0.9, debtServiceCoverage: 2.2 }
		]
	};

	// Use provided data or fallback to sample data
	const projectData = data?.projects || sampleData.projects;

	// Group projects by type and country
	const groupedByType = {};
	const groupedByCountry = {};

	projectData.forEach(project => {
		// Group by type
		if (!groupedByType[project.type]) {
			groupedByType[project.type] = [];
		}
		groupedByType[project.type].push(project);

		// Group by country
		if (!groupedByCountry[project.country]) {
			groupedByCountry[project.country] = [];
		}
		groupedByCountry[project.country].push(project);
	});

	// Calculate average metrics by group
	const calculateGroupMetrics = groups => {
		const result = {};

		Object.entries(groups).forEach(([key, projects]) => {
			result[key] = {
				irr: projects.reduce((sum, p) => sum + p.irr, 0) / projects.length,
				yieldOnCost: projects.reduce((sum, p) => sum + p.yieldOnCost, 0) / projects.length,
				ebitdaMargin: projects.reduce((sum, p) => sum + (p.ebitdaMargin || 0), 0) / projects.length,
				debtServiceCoverage: projects.reduce((sum, p) => sum + (p.debtServiceCoverage || 0), 0) / projects.length,
				count: projects.length
			};
		});

		return result;
	};

	const metricsByType = calculateGroupMetrics(groupedByType);
	const metricsByCountry = calculateGroupMetrics(groupedByCountry);

	// Available metrics for selection
	const metrics = [
		{ id: "irr", name: t("metric.irr"), format: val => `${(val * 100).toFixed(1)}%` },
		{ id: "yieldOnCost", name: t("metric.yieldOnCost"), format: val => `${(val * 100).toFixed(1)}%` },
		{ id: "ebitdaMargin", name: t("metric.ebitdaMargin"), format: val => `${(val * 100).toFixed(1)}%` },
		{ id: "debtServiceCoverage", name: t("metric.debtServiceCoverage"), format: val => val.toFixed(2) }
	];

	// Find the selected metric config
	const selectedMetricConfig = metrics.find(m => m.id === selectedMetric);

	// Calculate color for a cell based on its value relative to min/max
	const getColorForValue = (value, min, max) => {
		// Normalize value between 0 and 1
		const normalized = (value - min) / (max - min);

		// Choose a color scale based on theme and metric
		if (selectedMetric === "debtServiceCoverage") {
			// For DSCR, higher is better
			const startColor = theme.palette.error.light;
			const endColor = theme.palette.success.light;
			return interpolateColor(startColor, endColor, normalized);
		} else {
			// For other metrics (IRR, Yield, EBITDA margin), higher is also better
			const startColor = theme.palette.error.light;
			const midColor = theme.palette.warning.light;
			const endColor = theme.palette.success.light;

			if (normalized < 0.5) {
				return interpolateColor(startColor, midColor, normalized * 2);
			} else {
				return interpolateColor(midColor, endColor, (normalized - 0.5) * 2);
			}
		}
	};

	// Helper to interpolate between colors
	const interpolateColor = (color1, color2, factor) => {
		// Convert hex to RGB
		const hex2rgb = hex => {
			const r = parseInt(hex.slice(1, 3), 16);
			const g = parseInt(hex.slice(3, 5), 16);
			const b = parseInt(hex.slice(5, 7), 16);
			return [r, g, b];
		};

		// Convert RGB to hex
		const rgb2hex = rgb => {
			return (
				"#" +
				rgb
					.map(val => {
						const hex = Math.round(val).toString(16);
						return hex.length === 1 ? "0" + hex : hex;
					})
					.join("")
			);
		};

		const rgb1 = hex2rgb(color1);
		const rgb2 = hex2rgb(color2);

		const result = rgb1.map((val, i) => {
			return val + factor * (rgb2[i] - val);
		});

		return rgb2hex(result);
	};

	// Find min and max values for current metric to determine color scale
	const getMinMaxForMetric = metric => {
		const allValues = [...Object.values(metricsByType).map(m => m[metric]), ...Object.values(metricsByCountry).map(m => m[metric])];

		return {
			min: Math.min(...allValues),
			max: Math.max(...allValues)
		};
	};

	const { min, max } = getMinMaxForMetric(selectedMetric);

	// Render a heat map cell
	const renderCell = (key, value, count, rowType) => {
		const formattedValue = selectedMetricConfig.format(value);
		const cellColor = getColorForValue(value, min, max);
		const isHovered = hoveredCell === `${rowType}-${key}`;

		return (
			<Box
				key={key}
				sx={{
					p: 2,
					backgroundColor: cellColor,
					flex: 1,
					minWidth: 100,
					borderRadius: 1,
					m: 0.5,
					transition: "all 0.2s ease",
					transform: isHovered ? "scale(1.05)" : "scale(1)",
					boxShadow: isHovered ? 3 : 1,
					cursor: "pointer"
				}}
				onMouseEnter={() => setHoveredCell(`${rowType}-${key}`)}
				onMouseLeave={() => setHoveredCell(null)}>
				<Typography variant="subtitle2" fontWeight="bold">
					{key}
				</Typography>
				<Typography variant="h6">{formattedValue}</Typography>
				<Typography variant="caption" color="text.secondary">
					{`${count} ${t("metric.projects")}`}
				</Typography>
			</Box>
		);
	};

	// Loading effect when changing metrics
	useEffect(() => {
		setLoading(true);
		const timer = setTimeout(() => setLoading(false), 300);
		return () => clearTimeout(timer);
	}, [selectedMetric]);

	return (
		<Paper
			sx={{
				height: "100%",
				p: 2,
				display: "flex",
				flexDirection: "column",
				borderRadius: 1,
				overflow: "hidden"
			}}>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
				<Typography variant="h6" color="text.primary">
					{t("charts.heatmap.title")}
				</Typography>

				<FormControl variant="outlined" size="small">
					<InputLabel id="metric-select-label">{t("charts.heatmap.metric")}</InputLabel>
					<Select labelId="metric-select-label" value={selectedMetric} onChange={e => setSelectedMetric(e.target.value)} label={t("charts.heatmap.metric")} sx={{ minWidth: 150 }}>
						{metrics.map(metric => (
							<MenuItem key={metric.id} value={metric.id}>
								{metric.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
					<CircularProgress size={40} />
				</Box>
			) : (
				<Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "auto" }}>
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
						<Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
							{t("charts.heatmap.byType")}
						</Typography>

						<Box sx={{ display: "flex", flexWrap: "wrap" }}>{Object.entries(metricsByType).map(([type, metrics]) => renderCell(type, metrics[selectedMetric], metrics.count, "type"))}</Box>

						<Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
							{t("charts.heatmap.byCountry")}
						</Typography>

						<Box sx={{ display: "flex", flexWrap: "wrap" }}>{Object.entries(metricsByCountry).map(([country, metrics]) => renderCell(country, metrics[selectedMetric], metrics.count, "country"))}</Box>
					</motion.div>

					<Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
						<Typography variant="caption" color="text.secondary">
							{t("charts.heatmap.description")}
						</Typography>
					</Box>
				</Box>
			)}
		</Paper>
	);
};

export default MetricsHeatMap;
