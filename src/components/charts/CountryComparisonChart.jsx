import React from "react";
import PropTypes from "prop-types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, Cell, LabelList } from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import { ChartTheme } from "./ChartTheme";
import { Box, Typography, Paper, useTheme } from "@mui/material";

export function CountryComparisonChart({ data = [] }) {
	const muiTheme = useTheme();

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
		.slice(0, 6); // Show only top 6 countries

	// Find max values for scaling - with safety checks for empty data
	const maxCapacity = chartData.length > 0 ? Math.max(...chartData.map(item => item.capacity)) * 1.1 : 100;
	const maxInvestment = chartData.length > 0 ? Math.max(...chartData.map(item => item.investment)) * 1.1 : 100;

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
					No country data available
				</Typography>
			</Paper>
		);
	}

	// Custom formatter for tooltips
	const formatTooltipValue = (value, name) => {
		if (name === "capacity") {
			return `${value.toFixed(0)} MW`;
		}
		if (name === "investment") {
			return `$${value.toLocaleString()}M`;
		}
		return value;
	};

	// Custom tick component to handle long country names
	const CustomizedAxisTick = props => {
		const { x, y, payload } = props;
		return (
			<g transform={`translate(${x},${y})`}>
				<text x={0} y={0} dy={16} textAnchor="middle" fill={muiTheme.palette.text.secondary} fontSize={11}>
					{payload.value.length > 10 ? payload.value.substring(0, 8) + "..." : payload.value}
				</text>
			</g>
		);
	};

	// Get an appropriate color for each country
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

	// Return the bar chart with country comparison
	return (
		<Box sx={{ width: "100%", height: 400 }}>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData} margin={{ top: 30, right: 40, left: 20, bottom: 40 }} barCategoryGap={15}>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke={muiTheme.palette.divider} />
					<XAxis dataKey="country" tick={<CustomizedAxisTick />} height={40} stroke={muiTheme.palette.text.secondary} />

					{/* Left Y-axis for capacity */}
					<YAxis
						yAxisId="left"
						orientation="left"
						tickFormatter={value => `${value}MW`}
						domain={[0, maxCapacity]}
						tick={{ fontSize: 10 }}
						tickMargin={5}
						width={55}
						stroke={muiTheme.palette.text.secondary}>
						<Label value="Capacity (MW)" angle={-90} position="insideLeft" style={{ fontSize: 12, fill: muiTheme.palette.text.secondary }} offset={-5} />
					</YAxis>

					{/* Right Y-axis for investment */}
					<YAxis
						yAxisId="right"
						orientation="right"
						tickFormatter={value => `$${value}M`}
						domain={[0, maxInvestment]}
						tick={{ fontSize: 10 }}
						tickMargin={5}
						width={55}
						stroke={muiTheme.palette.text.secondary}>
						<Label value="Investment ($M)" angle={90} position="insideRight" style={{ fontSize: 12, fill: muiTheme.palette.text.secondary }} offset={10} />
					</YAxis>

					<Tooltip content={<CustomTooltip valueFormatter={formatTooltipValue} chartType="bar" />} />

					<Legend
						wrapperStyle={{
							paddingTop: 5,
							marginBottom: 5,
							fontSize: 12,
							color: muiTheme.palette.text.primary
						}}
						verticalAlign="top"
						align="center"
					/>

					<Bar yAxisId="left" dataKey="capacity" name="Capacity (MW)" radius={[4, 4, 0, 0]} barSize={30}>
						{chartData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={getCountryColor(index)} />
						))}
						<LabelList dataKey="capacity" position="top" formatter={value => `${value}MW`} style={{ fontSize: 10, fill: muiTheme.palette.text.secondary }} />
					</Bar>
				</BarChart>
			</ResponsiveContainer>
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
