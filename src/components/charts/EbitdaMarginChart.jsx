import React from "react";
import { Box, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { ChartsReferenceLine } from "@mui/x-charts";

export function EbitdaMarginChart({ data }) {
	const theme = useTheme();

	// Calculate EBITDA margin for each year
	const chartData = data.years.map((year, index) => {
		const revenue = data.revenues[index];
		const ebitda = data.ebitda[index];

		// Calculate margin (avoid division by zero)
		const margin = revenue > 0 ? (ebitda / revenue) * 100 : 0;

		return {
			year,
			margin: parseFloat(margin.toFixed(1)),
			revenue: revenue, // Include revenue for reference
			ebitda: ebitda // Include raw EBITDA for reference
		};
	});

	// Calculate the average margin for reference line
	const avgMargin = chartData.reduce((sum, item) => sum + item.margin, 0) / chartData.length;

	// Find industry benchmarks (this would typically come from external data)
	// For demo purposes, using static values
	const industryAvg = 15; // Example industry average EBITDA margin
	const targetMargin = 25; // Example target margin

	// Extract data for charts
	const years = chartData.map(d => d.year);
	const marginData = chartData.map(d => d.margin);

	// Calculate y-axis domain
	const maxMargin = Math.max(...marginData);
	const yMax = Math.max(100, Math.ceil(maxMargin / 10) * 10);

	// Determine optimal tick values to prevent overlapping
	const calculateTickValues = () => {
		if (chartData.length <= 5) return chartData.map(d => d.year);

		const step = Math.max(1, Math.floor(chartData.length / 4));
		const ticks = [];

		for (let i = 0; i < chartData.length; i += step) {
			ticks.push(chartData[i].year);
		}

		// Always include the last tick if not already included
		if (ticks[ticks.length - 1] !== chartData[chartData.length - 1].year) {
			ticks.push(chartData[chartData.length - 1].year);
		}

		return ticks;
	};

	// Value formatter for tooltips and axis labels
	const valueFormatter = value => `${value.toFixed(1)}%`;

	return (
		<Box sx={{ width: "100%", height: 400 }}>
			<LineChart
				height={400}
				series={[
					{
						data: marginData,
						label: "EBITDA Margin",
						valueFormatter,
						color: theme.palette.secondary.main,
						showMark: true,
						area: true,
						curve: "monotone",
						connectNulls: true
					}
				]}
				xAxis={[
					{
						data: years,
						scaleType: "point",
						tickValues: calculateTickValues(),
						valueFormatter: value => `Year: ${value}`
					}
				]}
				yAxis={[
					{
						min: 0,
						max: yMax,
						tickValues: [0, 20, 40, 60, 80, 100],
						valueFormatter,
						label: "EBITDA Margin (%)"
					}
				]}
				margin={{ top: 30, right: 40, left: 60, bottom: 40 }}
				slotProps={{
					legend: {
						position: { vertical: "top", horizontal: "middle" },
						labelStyle: {
							fontSize: 12,
							fill: theme.palette.text.primary
						}
					}
				}}>
				{/* Reference line for average margin */}
				<ChartsReferenceLine
					y={avgMargin}
					label={`Avg: ${avgMargin.toFixed(1)}%`}
					labelAlign="end"
					lineStyle={{
						stroke: theme.palette.primary.main,
						strokeDasharray: "3 3",
						strokeWidth: 1.5
					}}
					labelStyle={{
						fontSize: 11,
						fill: theme.palette.primary.main
					}}
				/>

				{/* Reference line for industry average */}
				<ChartsReferenceLine
					y={industryAvg}
					label={`Industry: ${industryAvg}%`}
					labelAlign="end"
					lineStyle={{
						stroke: theme.palette.warning.main,
						strokeDasharray: "3 3",
						strokeWidth: 1.5
					}}
					labelStyle={{
						fontSize: 11,
						fill: theme.palette.warning.main
					}}
				/>

				{/* Target Zone - since ChartsReferenceArea may not be available, use two reference lines */}
				<ChartsReferenceLine
					y={targetMargin}
					label="Target Zone"
					labelAlign="end"
					lineStyle={{
						stroke: theme.palette.success.light,
						strokeWidth: 1
					}}
					labelStyle={{
						fontSize: 11,
						fill: theme.palette.success.main
					}}
				/>
			</LineChart>
		</Box>
	);
}
