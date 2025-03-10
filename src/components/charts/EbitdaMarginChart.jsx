import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Legend, ReferenceLine, ReferenceArea, Label } from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import { ChartTheme } from "./ChartTheme";

export function EbitdaMarginChart({ data }) {
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

	// Custom formatting for tooltip
	const formatTooltipValue = (value, name) => {
		if (name === "margin") {
			return `${value.toFixed(1)}%`;
		}
		return value;
	};

	// Label formatter for tooltip
	const labelFormatter = label => `Year: ${label}`;

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

	// Calculate tick values
	const tickValues = calculateTickValues();

	return (
		<ResponsiveContainer width="100%" height="100%" aspect={2.5}>
			<ComposedChart data={chartData} margin={{ top: 30, right: 40, left: 25, bottom: 40 }}>
				<defs>
					<linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={ChartTheme.colors.secondary[0]} stopOpacity={0.8} />
						<stop offset="95%" stopColor={ChartTheme.colors.secondary[0]} stopOpacity={0.2} />
					</linearGradient>
					<linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
						<stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
					</linearGradient>
				</defs>

				{/* Reference area for target zone */}
				<ReferenceArea
					y1={targetMargin}
					y2={Math.max(100, Math.ceil(Math.max(...chartData.map(d => d.margin)) / 10) * 10)}
					fill="url(#targetGradient)"
					fillOpacity={0.2}
					label={{
						value: "Target Zone",
						position: "insideTopRight",
						fill: "#10b981",
						fontSize: 11
					}}
				/>

				<CartesianGrid strokeDasharray="3 3" stroke={ChartTheme.grid.stroke} vertical={false} />

				<XAxis
					dataKey="year"
					tick={{ fontSize: 12, fill: "#666" }}
					tickLine={{ stroke: ChartTheme.axis.tickStroke }}
					axisLine={{ stroke: ChartTheme.axis.stroke }}
					padding={{ left: 25, right: 25 }}
					tickMargin={10}
					ticks={tickValues}
					height={50}
				/>

				<YAxis
					domain={[0, Math.max(100, Math.ceil(Math.max(...chartData.map(d => d.margin)) / 10) * 10)]}
					tickFormatter={value => `${value}%`}
					tick={{ fontSize: 12, fill: "#666" }}
					tickLine={{ stroke: ChartTheme.axis.tickStroke }}
					axisLine={{ stroke: ChartTheme.axis.stroke }}
					width={50}
					label={{
						value: "EBITDA Margin (%)",
						angle: -90,
						position: "insideLeft",
						offset: 0,
						style: {
							fontSize: 13,
							fill: "#666",
							textAnchor: "middle"
						}
					}}
					tickMargin={8}
				/>

				<Tooltip content={<CustomTooltip labelFormatter={labelFormatter} valueFormatter={formatTooltipValue} chartType="line" />} animationDuration={300} cursor={{ strokeDasharray: "3 3" }} />

				<Legend
					wrapperStyle={{
						paddingTop: 5,
						paddingBottom: 10,
						fontSize: 12,
						fontWeight: 500
					}}
					iconType="circle"
					iconSize={8}
					verticalAlign="top"
					align="center"
					layout="horizontal"
				/>

				{/* Reference lines */}
				<ReferenceLine y={avgMargin} stroke={ChartTheme.colors.primary[1]} strokeDasharray="3 3" strokeWidth={1.5}>
					<Label value={`Avg: ${avgMargin.toFixed(1)}%`} position="right" fill={ChartTheme.colors.primary[1]} fontSize={11} offset={2} />
				</ReferenceLine>

				<ReferenceLine y={industryAvg} stroke={ChartTheme.colors.warning[0]} strokeDasharray="3 3" strokeWidth={1.5}>
					<Label value={`Industry: ${industryAvg}%`} position="left" fill={ChartTheme.colors.warning[0]} fontSize={11} offset={2} />
				</ReferenceLine>

				{/* Area under the line */}
				<Area type="monotone" dataKey="margin" fill="url(#marginGradient)" fillOpacity={0.3} stroke="none" animationDuration={1500} animationEasing="ease-out" />

				{/* Main line */}
				<Line
					type="monotone"
					dataKey="margin"
					name="EBITDA Margin"
					stroke={ChartTheme.colors.secondary[0]}
					strokeWidth={2.5}
					dot={{
						r: 5,
						strokeWidth: 2,
						fill: "#fff",
						stroke: ChartTheme.colors.secondary[0]
					}}
					activeDot={{
						r: 7,
						strokeWidth: 2,
						fill: "#fff",
						stroke: ChartTheme.colors.secondary[0],
						className: "pulse-dot"
					}}
					animationDuration={1200}
					animationEasing="ease-out"
					connectNulls={true}
				/>
			</ComposedChart>
		</ResponsiveContainer>
	);
}
