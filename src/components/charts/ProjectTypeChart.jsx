import React from "react";
import { ChartWrapper } from "./ChartWrapper";

export function ProjectTypeChart({ data }) {
	// Group projects by type and calculate total capacity
	const projectTypes = data.reduce((acc, project) => {
		const type = project.type;
		if (!acc[type]) {
			acc[type] = {
				name: type,
				capacity: 0,
				count: 0
			};
		}
		acc[type].capacity += project.capacity;
		acc[type].count += 1;
		return acc;
	}, {});

	// Convert to array for the chart - keeping Google Charts format for compatibility
	const chartData = [["Project Type", "Capacity (MW)"], ...Object.values(projectTypes).map(type => [type.name, type.capacity])];

	// Colors for different project types
	const sliceColors = [
		"#3b82f6", // On-shore Wind
		"#2563eb", // Off-shore Wind
		"#f59e0b", // Solar Ground
		"#d97706" // Solar Rooftop
	];

	// Prepare options in a format compatible with the updated ChartWrapper
	const options = {
		pieHole: 0.4, // For donut chart if supported
		legend: { position: "bottom" },
		series: {}, // Initialize series
		pieSliceText: "percentage",
		tooltip: {
			text: "value",
			trigger: "focus"
		},
		chartArea: {
			width: "85%",
			height: "75%"
		},
		animation: {
			startup: true,
			duration: 1000,
			easing: "out"
		}
	};

	// Add color information in a format the new ChartWrapper understands
	Object.values(projectTypes).forEach((_, index) => {
		options.series[index] = { color: sliceColors[index % sliceColors.length] };
	});

	return <ChartWrapper chartType="PieChart" data={chartData} options={options} chartName="Project Type Chart" />;
}
