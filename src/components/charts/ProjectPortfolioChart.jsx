import React from "react";
import { Box, useTheme } from "@mui/material";
import { ScatterChart } from "@mui/x-charts/ScatterChart";

export function ProjectPortfolioChart({ data }) {
	const theme = useTheme();

	// Separate wind and solar projects
	const windProjects = data.filter(p => p.type.includes("Wind"));
	const solarProjects = data.filter(p => p.type.includes("Solar"));

	// Prepare data for MUI X Charts
	const windData = windProjects.map(project => ({
		x: project.capacity, // Capacity on x-axis
		y: project.investmentCost, // Investment on y-axis
		size: project.irr * 100, // IRR determines the bubble size
		id: project.name, // Name as ID
		...project // Include all project data for tooltip
	}));

	const solarData = solarProjects.map(project => ({
		x: project.capacity,
		y: project.investmentCost,
		size: project.irr * 100,
		id: project.name,
		...project
	}));

	// Custom tooltip formatter
	const valueFormatter = (value, type) => {
		if (type === "x") return `${value} MW`;
		if (type === "y") return `€${value}M`;
		if (type === "size") return `${value.toFixed(1)}%`;
		return value;
	};

	// Function to get the tooltip content (project details)
	const getTooltipContent = params => {
		const { item } = params;

		return [`${item.id}`, `${item.type} | ${item.country}`, `Capacity: ${item.x} MW`, `Investment: €${item.y}M`, `IRR: ${item.size.toFixed(1)}%`];
	};

	return (
		<Box sx={{ width: "100%", height: 400 }}>
			<ScatterChart
				series={[
					{
						label: "Wind Projects",
						data: windData,
						valueFormatter,
						color: theme.palette.primary.main,
						markerSize: 12 // Base marker size, will be multiplied by the normalized IRR value
					},
					{
						label: "Solar Projects",
						data: solarData,
						valueFormatter,
						color: theme.palette.warning.main,
						markerSize: 12
					}
				]}
				xAxis={[
					{
						label: "Capacity (MW)",
						min: 0,
						max: Math.max(...data.map(p => p.capacity)) * 1.1
					}
				]}
				yAxis={[
					{
						label: "Investment (€M)",
						min: 0,
						max: Math.max(...data.map(p => p.investmentCost)) * 1.1
					}
				]}
				margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
				height={400}
				slotProps={{
					legend: {
						position: { vertical: "top", horizontal: "right" }
					}
				}}
				tooltip={{
					trigger: "item",
					itemContent: getTooltipContent
				}}
			/>
		</Box>
	);
}
