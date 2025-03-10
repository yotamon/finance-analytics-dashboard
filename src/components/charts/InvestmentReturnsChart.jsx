import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label, Cell } from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import { ChartTheme } from "./ChartTheme";

export function InvestmentReturnsChart({ data }) {
	// Sort projects by IRR in descending order and take top 5
	const topProjects = [...data].sort((a, b) => (b.irr || 0) - (a.irr || 0)).slice(0, 5);

	// Format data for the chart, shorten project names if needed
	const chartData = topProjects.map(project => {
		// Shorten project name if it's too long
		const displayName = project.name.length > 12 ? project.name.substring(0, 10) + "..." : project.name;

		return {
			name: displayName,
			fullName: project.name,
			irr: project.irr || 0,
			investment: project.investmentCost || 0,
			type: project.type || "Unknown",
			status: project.status || "Unknown"
		};
	});

	// Format tooltip values
	const formatTooltipValue = (value, name) => {
		if (name === "irr") {
			return `${(value * 100).toFixed(1)}%`;
		}
		if (name === "investment") {
			return `$${value.toLocaleString()}M`;
		}
		return value;
	};

	// Custom tick component to handle long project names
	const CustomizedXAxisTick = props => {
		const { x, y, payload } = props;
		return (
			<g transform={`translate(${x},${y})`}>
				<text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={11}>
					{payload.value}
				</text>
			</g>
		);
	};

	// Get colors based on project type
	const getIrrColor = index => {
		return ChartTheme.colors.primary[index % ChartTheme.colors.primary.length];
	};

	return (
		<ResponsiveContainer width="100%" height={400}>
			<BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 40 }} barCategoryGap={16}>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />

				<XAxis dataKey="name" tick={<CustomizedXAxisTick />} height={50} interval={0} />

				{/* Left Y-axis for IRR */}
				<YAxis
					yAxisId="left"
					orientation="left"
					tickFormatter={value => `${(value * 100).toFixed(0)}%`}
					domain={[0, Math.max(...chartData.map(d => d.irr)) * 1.2]}
					tick={{ fontSize: 10 }}
					tickMargin={5}
					width={50}>
					<Label value="IRR (%)" angle={-90} position="insideLeft" style={{ fontSize: 12, fill: "#666" }} offset={-5} />
				</YAxis>

				{/* Right Y-axis for Investment */}
				<YAxis
					yAxisId="right"
					orientation="right"
					tickFormatter={value => `$${value}M`}
					domain={[0, Math.max(...chartData.map(d => d.investment)) * 1.2]}
					tick={{ fontSize: 10 }}
					tickMargin={5}
					width={55}>
					<Label value="Investment ($M)" angle={90} position="insideRight" style={{ fontSize: 12, fill: "#666" }} offset={5} />
				</YAxis>

				<Tooltip content={<CustomTooltip labelFormatter={(name, item) => item[0]?.payload?.fullName || name} valueFormatter={formatTooltipValue} chartType="bar" />} />

				<Legend
					wrapperStyle={{
						paddingTop: 10,
						paddingBottom: 5,
						fontSize: 12
					}}
					verticalAlign="top"
					align="center"
				/>

				<Bar yAxisId="left" dataKey="irr" name="IRR (%)" radius={[4, 4, 0, 0]} barSize={24}>
					{chartData.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={getIrrColor(index)} />
					))}
				</Bar>

				<Bar yAxisId="right" dataKey="investment" name="Investment ($M)" radius={[4, 4, 0, 0]} fill="#8884d8" opacity={0.6} barSize={24} />
			</BarChart>
		</ResponsiveContainer>
	);
}
