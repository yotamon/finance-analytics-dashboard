import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import { useI18n } from "../../context/I18nContext";
import { alpha } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts";

export function CountryComparisonChart({ data = [] }) {
	const muiTheme = useTheme();
	const { t } = useI18n();

	// Ensure data is an array before processing
	const dataArray = Array.isArray(data) ? data : [];

	// Group data by country and calculate totals
	const groupedData = dataArray.reduce((acc, project) => {
		const country = project.country || "Unknown";
		if (!acc[country]) {
			acc[country] = {
				country,
				investment: 0,
				capacity: 0,
				projects: 0
			};
		}
		acc[country].investment += project.investmentCost || 0;
		acc[country].capacity += project.capacity || 0;
		acc[country].projects += 1;
		return acc;
	}, {});

	// Convert to array and sort by investment amount
	const chartData = Object.values(groupedData)
		.sort((a, b) => b.capacity - a.capacity)
		.slice(0, 6) // Show only top 6 countries
		.map((item, index) => ({
			...item,
			id: `country-${index}`, // Add unique id for each country
			capacity: Math.max(0, item.capacity), // Ensure positive values
			investment: Math.max(0, item.investment) // Ensure positive values
		}));

	// If no data is available, show a message
	if (chartData.length === 0) {
		return (
			<Paper
				sx={{
					height: 400,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					bgcolor: muiTheme.palette.background.paper,
					borderRadius: 2
				}}
				elevation={1}>
				<Typography variant="body1" color="text.secondary">
					{t("charts.noData")}
				</Typography>
			</Paper>
		);
	}

	// Get country names for x-axis
	const countries = chartData.map(item => item.country);

	// Format data for MUI X Charts
	const capacityData = chartData.map(item => item.capacity);
	const investmentData = chartData.map(item => item.investment);

	// Get an appropriate color for each country for capacity bars
	const getCountryColor = index => {
		// Use Material UI theme colors
		const colors = [
			muiTheme.palette.primary.main,
			muiTheme.palette.secondary.main,
			muiTheme.palette.error.main,
			muiTheme.palette.warning.main,
			muiTheme.palette.info.main,
			muiTheme.palette.success.main
		];
		return colors[index % colors.length];
	};

	// Generate colors for capacity bars
	const capacityColors = chartData.map((_, index) => getCountryColor(index));

	// Chart configuration
	const chartSetting = {
		height: 400,
		sx: {
			[`.${axisClasses.left} .${axisClasses.label}`]: {
				transform: "translate(-20px, 0)"
			},
			[`.${axisClasses.right} .${axisClasses.label}`]: {
				transform: "translate(20px, 0)"
			}
		}
	};

	const valueFormatter = (value, type) => {
		if (type === "capacity") {
			return `${value.toFixed(0)} MW`;
		}
		if (type === "investment") {
			return `$${value.toLocaleString()}M`;
		}
		return value;
	};

	return (
		<Box sx={{ width: "100%", height: 400, position: "relative" }}>
			<BarChart
				dataset={chartData}
				xAxis={[
					{
						scaleType: "band",
						data: countries,
						tickLabelStyle: {
							angle: 0,
							textAnchor: "middle",
							fontSize: 11,
							fill: muiTheme.palette.text.secondary
						},
						label: "Country"
					}
				]}
				yAxis={[
					{
						id: "capacityAxis",
						scaleType: "linear",
						valueFormatter: value => valueFormatter(value, "capacity"),
						labelStyle: {
							fontSize: 12,
							fill: muiTheme.palette.text.secondary
						},
						tickLabelStyle: {
							fontSize: 10,
							fill: muiTheme.palette.text.secondary
						},
						label: t("charts.axis.capacity")
					},
					{
						id: "investmentAxis",
						scaleType: "linear",
						valueFormatter: value => valueFormatter(value, "investment"),
						labelStyle: {
							fontSize: 12,
							fill: muiTheme.palette.text.secondary
						},
						tickLabelStyle: {
							fontSize: 10,
							fill: muiTheme.palette.text.secondary
						},
						label: t("charts.label.investment")
					}
				]}
				series={[
					{
						id: "capacity",
						data: capacityData,
						label: t("charts.label.capacity"),
						valueFormatter: value => valueFormatter(value, "capacity"),
						yAxisKey: "capacityAxis",
						color: muiTheme.palette.primary.main,
						highlightScope: {
							highlighted: "item",
							faded: "global"
						}
					},
					{
						id: "investment",
						data: investmentData,
						label: t("charts.label.investment"),
						valueFormatter: value => valueFormatter(value, "investment"),
						yAxisKey: "investmentAxis",
						color: alpha(muiTheme.palette.secondary.main, 0.7),
						highlightScope: {
							highlighted: "item",
							faded: "global"
						}
					}
				]}
				colors={[muiTheme.palette.primary.main, alpha(muiTheme.palette.secondary.main, 0.7)]}
				margin={{ top: 30, right: 40, left: 20, bottom: 40 }}
				slotProps={{
					legend: {
						position: { vertical: "top", horizontal: "middle" },
						labelStyle: {
							fontSize: 12,
							fill: muiTheme.palette.text.primary
						}
					}
				}}
				{...chartSetting}
			/>
		</Box>
	);
}

// Add PropTypes for documentation and type checking
CountryComparisonChart.propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			country: PropTypes.string,
			capacity: PropTypes.number,
			investmentCost: PropTypes.number
		})
	)
};
